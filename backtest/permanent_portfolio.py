"""永久投资组合回测：股票版（SPY/GLD/TLT/SGOV）与币版（SPYB/XAUm/TLTon/SGOVon 按对标资产还原）。

规则：四项各 25%，任一资产 <=15% 或 >=35% 时全部调回 25%（按每日收盘检查）。
数据：Yahoo Finance 复权收盘价（含分红再投资），缓存在 backtest/data/。
用法：python3 backtest/permanent_portfolio.py
"""
import datetime
import json
import math
import pathlib
import statistics
import time
import urllib.request

START = datetime.date(2005, 12, 30)  # 2005 年最后一个交易日收盘建仓
END_TS = 1800000000
TICKERS = ['SPY', 'GLD', 'TLT', 'IEF', 'BIL', 'SGOV', '^IRX']
DATA = pathlib.Path(__file__).with_name('data')
WITHHOLDING = 0.30      # SPYB 分红扣 30% 预扣税后再投
GLD_FEE = 0.004         # XAUm 按现货金计，加回 GLD 每年 0.40% 管理费
COIN_SWAP_COST = 0.003  # 币版每次调仓按成交额额外扣 0.3%


def fetch(ticker):
    path = DATA / (ticker.strip('^') + '.json')
    if not path.exists():
        DATA.mkdir(exist_ok=True)
        url = (f'https://query2.finance.yahoo.com/v8/finance/chart/{ticker}?period1=1133395200'
               f'&period2={END_TS}&interval=1d&events=div%2Csplit&includeAdjustedClose=true')
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        path.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        time.sleep(1)
    result = json.loads(path.read_text())['chart']['result'][0]
    day = lambda t: datetime.datetime.fromtimestamp(t, datetime.timezone.utc).date()
    quote = result['indicators']
    closes = quote['quote'][0]['close']
    adjusted = quote['adjclose'][0]['adjclose'] if 'adjclose' in quote else closes
    prices = {day(t): (a, c) for t, a, c in zip(result['timestamp'], adjusted, closes) if a is not None and c is not None}
    dividends = {day(v['date']): v['amount'] for v in (result.get('events', {}).get('dividends') or {}).values()}
    return prices, dividends


RAW = {t.strip('^'): fetch(t) for t in TICKERS}
DAYS = sorted(d for d in RAW['SPY'][0] if d >= START)
PAIRS = list(zip(DAYS, DAYS[1:]))


def adjusted_returns(ticker):
    prices = RAW[ticker][0]
    return {b: prices[b][0] / prices[a][0] - 1 for a, b in PAIRS if a in prices and b in prices}


def cash_returns():
    """0-3 个月短债：SGOV（2020-06 起），之前用 BIL（2007-05 起），再之前用 3 个月国库券利率。"""
    bil, sgov, irx = RAW['BIL'][0], RAW['SGOV'][0], RAW['IRX'][0]
    out, rate = {}, irx[DAYS[0]][1]
    for a, b in PAIRS:
        if a in sgov and b in sgov:
            out[b] = sgov[b][0] / sgov[a][0] - 1
        elif a in bil and b in bil:
            out[b] = bil[b][0] / bil[a][0] - 1
        else:
            rate = irx.get(a, (None, rate))[1]
            out[b] = rate / 100 * (b - a).days / 360
    return out


def spy_after_withholding():
    prices, dividends = RAW['SPY']
    return {b: (prices[b][1] + (1 - WITHHOLDING) * dividends.get(b, 0)) / prices[a][1] - 1 for a, b in PAIRS}


def spot_gold():
    gld = adjusted_returns('GLD')
    return {b: (1 + gld[b]) * (1 + GLD_FEE) ** ((b - a).days / 365.25) - 1 for a, b in PAIRS}


R = {'SPY': adjusted_returns('SPY'), 'GLD': adjusted_returns('GLD'), 'TLT': adjusted_returns('TLT'),
     'IEF': adjusted_returns('IEF'), 'CASH': cash_returns(), 'SPYB': spy_after_withholding(), 'XAUm': spot_gold()}


def band_portfolio(legs, cost=0.0, low=0.15, high=0.35):
    holdings, nav, rebalances = [0.25] * 4, {DAYS[0]: 1.0}, []
    for d in DAYS[1:]:
        holdings = [h * (1 + R[leg][d]) for h, leg in zip(holdings, legs)]
        value = sum(holdings)
        weights = [h / value for h in holdings]
        if any(w <= low or w >= high for w in weights):
            value -= sum(abs(w - 0.25) for w in weights) / 2 * value * cost
            holdings = [value / 4] * 4
            rebalances.append(d)
        nav[d] = value
    return nav, rebalances


def buy_and_hold(leg):
    nav, value = {DAYS[0]: 1.0}, 1.0
    for d in DAYS[1:]:
        value *= 1 + R[leg][d]
        nav[d] = value
    return nav


def stats(nav):
    years = (DAYS[-1] - DAYS[0]).days / 365.25
    cagr = nav[DAYS[-1]] ** (1 / years) - 1
    peak, drawdown = 0.0, 0.0
    for d in DAYS:
        peak = max(peak, nav[d])
        drawdown = min(drawdown, nav[d] / peak - 1)
    yearly, previous = {}, 1.0
    for y in range(DAYS[1].year, DAYS[-1].year + 1):
        close = nav[max(d for d in DAYS if d.year == y)]
        yearly[y], previous = close / previous - 1, close
    daily = [nav[b] / nav[a] - 1 for a, b in PAIRS]
    return {'cagr': cagr, 'mdd': drawdown, 'yearly': yearly, 'growth': nav[DAYS[-1]],
            'vol': statistics.pstdev(daily) * math.sqrt(252)}


def pct(x, digits=1):
    s = f'{x * 100:.{digits}f}'
    return ('0.' + '0' * digits if float(s) == 0 else s) + '%'


def label(y):
    return f'{y}' if y < DAYS[-1].year else f'{y}（截至{DAYS[-1].month}/{DAYS[-1].day}）'


stock_nav, stock_reb = band_portfolio(['SPY', 'GLD', 'TLT', 'CASH'])
coin_nav, coin_reb = band_portfolio(['SPYB', 'XAUm', 'TLT', 'CASH'], cost=COIN_SWAP_COST)
stock, coin = stats(stock_nav), stats(coin_nav)
ief = stats(band_portfolio(['SPY', 'GLD', 'IEF', 'CASH'])[0])
single = {leg: stats(buy_and_hold(leg)) for leg in ['SPY', 'GLD', 'TLT', 'CASH']}
full_years = [y for y in stock['yearly'] if y < DAYS[-1].year]

print(f'区间 {DAYS[1]} ~ {DAYS[-1]}，{(DAYS[-1] - DAYS[0]).days / 365.25:.2f} 年')
for name, s, reb in [('股票版', stock, stock_reb), ('币版', coin, coin_reb)]:
    losing = [y for y in full_years if s['yearly'][y] < 0]
    print(f"{name}: 年化 {pct(s['cagr'], 2)}  最大回撤 {pct(s['mdd'])}  波动率 {pct(s['vol'])}  "
          f"1 美元变 {s['growth']:.2f}  亏损年份 {losing}  调仓 {len(reb)} 次 {[str(d) for d in reb]}")
print(f"长债换成 IEF: 年化 {pct(ief['cagr'], 2)}  最大回撤 {pct(ief['mdd'])}  "
      f"亏损年份 {[y for y in full_years if ief['yearly'][y] < 0]}")
print(f"全仓 SPY: 年化 {pct(single['SPY']['cagr'], 2)}  最大回撤 {pct(single['SPY']['mdd'])}  波动率 {pct(single['SPY']['vol'])}")
diffs = {y: coin['yearly'][y] - stock['yearly'][y] for y in stock['yearly']}
print(f"币版 - 股票版：年化差 {pct(coin['cagr'] - stock['cagr'], 2)}，完整年份最大单年差 "
      f"{pct(max(abs(diffs[y]) for y in full_years))}")

print('\n| 年份 | 标普500 SPY | 黄金 GLD | 长债 TLT | 短债 SGOV | **永久组合** |\n| :-- | --: | --: | --: | --: | --: |')
for y in stock['yearly']:
    cells = ' | '.join(pct(single[leg]['yearly'][y]) for leg in ['SPY', 'GLD', 'TLT', 'CASH'])
    print(f"| {label(y)} | {cells} | **{pct(stock['yearly'][y])}** |")

print('\n| 年份 | 股票版 | 币版 | 差异 |\n| :-- | --: | --: | --: |')
for y in stock['yearly']:
    d = f'{diffs[y] * 100:+.1f}'.replace('-0.0', '0.0').replace('+0.0', '0.0')
    print(f"| {label(y)} | {pct(stock['yearly'][y])} | {pct(coin['yearly'][y])} | {d} |")
