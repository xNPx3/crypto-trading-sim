export async function fetchMarketData(coins) {
    const data = []

    for (var i in coins) {
        const res_ = await fetch('https://api.coingecko.com/api/v3/coins/' + coins[i] + '/market_chart?vs_currency=usd&days=1')

        data[i] = {}
        data[i] = await res_.json()
        data[i]['name'] = coins[i].toString()
    }
    for (var i in data) {
        delete data[i]['market_caps']
        delete data[i]['total_volumes']
    }

    return data
}