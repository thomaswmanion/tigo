import request from 'request';
import { RequestAPI, Request, CoreOptions } from 'request';

const getCache: any = {};
export let endpoints = {
  login: 'https://api.robinhood.com/oauth2/token/',
  investment_profile: 'https://api.robinhood.com/user/investment_profile/',
  accounts: 'https://api.robinhood.com/accounts/',
  ach_iav_auth: 'https://api.robinhood.com/ach/iav/auth/',
  ach_relationships: 'https://api.robinhood.com/ach/relationships/',
  ach_transfers: 'https://api.robinhood.com/ach/transfers/',
  applications: 'https://api.robinhood.com/applications/',
  dividends: 'https://api.robinhood.com/dividends/',
  edocuments: 'https://api.robinhood.com/documents/',
  instruments: 'https://api.robinhood.com/instruments/',
  margin_upgrade: 'https://api.robinhood.com/margin/upgrades/',
  markets: 'https://api.robinhood.com/markets/',
  notifications: 'https://api.robinhood.com/notifications/',
  orders: 'https://api.robinhood.com/orders/',
  password_reset: 'https://api.robinhood.com/password_reset/request/',
  quotes: 'https://api.robinhood.com/quotes/',
  document_requests: 'https://api.robinhood.com/upload/document_requests/',
  user: 'https://api.robinhood.com/user/',
  watchlists: 'https://api.robinhood.com/watchlists/',
  positions: 'https://api.robinhood.com/positions/',
  portfolios: 'https://api.robinhood.com/portfolios/',
  fundamentals: 'https://api.robinhood.com/fundamentals/', // Need to concatenate symbol to end.
  historicals(symbol: string, interval: 'week' | 'day' | '10minute' | '5minute' | 'null', span: 'day' | 'week' | 'year' | '5year' | 'all') {
    return `https://api.robinhood.com/quotes/historicals/${symbol}/?interval=${interval}&span=${span}&bounds=regular`;
  },
  cancel(orderId: string) {
    return `https://api.robinhood.com/orders/${orderId}/cancel/`;
  },
  root(restOfUrl: string) {
    return `https://api.robinhood.com${restOfUrl}`;
  }
};

export class Robinhood {
  request: RequestAPI<Request, CoreOptions, any>;
  account: string;
  authToken: string;
  headers: any;
  constructor(private username?: string, private password?: string) {
    this.headers = {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en;q=1, fr;q=0.9, de;q=0.8, ja;q=0.7, nl;q=0.6, it;q=0.5',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'X-Robinhood-API-Version': '1.0.0',
      'Connection': 'keep-alive',
      'User-Agent': 'Robinhood/823 (iPhone; iOS 7.1.2; Scale/2.00)'
    };
    this.request = request.defaults({
      headers: this.headers,
      json: true,
      gzip: true
    });
  }

  post(properties: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.request.post(properties, (err, _, body) => {
        if (err) {
          return reject(err);
        }
        resolve(body);
      });
    });
  }

  async login(): Promise<any> {
    const loginBody = await this.post({
      uri: endpoints.login,
      form: {
        grant_type: 'password',
        client_id: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS',
        username: this.username,
        password: this.password
      }
    });
    this.authToken = loginBody.access_token;
    console.log(this.authToken, loginBody);
    this.headers.Authorization = 'Bearer ' + this.authToken;

    const accounts = await this.accounts();
    console.log(accounts);
    this.account = accounts.results[0].url;
  }

  accounts(): Promise<any> {
    return this.get(endpoints.accounts);
  }

  cancel(orderId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.request.post(endpoints.cancel(orderId), (err, _, body) => {
        if (err) {
          return reject(err);
        }
        resolve(body);
      });
    });
  }

  get(uri: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (getCache[uri]) {
        return resolve(getCache[uri]);
      }
      this.request.get({ uri }, (err, _, body) => {
        if (err) {
          return reject(err);
        }
        getCache[uri] = body;
        resolve(body);
      });
    });
  }

  investment_profile(): Promise<any> {
    return this.get(endpoints.investment_profile);
  }

  instruments(symbol: string) {
    return new Promise<any>((resolve, reject) => {
      return this.request.get({
        uri: endpoints.instruments,
        qs: { query: symbol.toUpperCase() }
      }, (err, _, body) => {
        if (err) {
          return reject(err);
        }
        return resolve(body);
      });
    });
  }

  quote_data(symbol: string): Promise<QuoteDataResultBody> {
    return new Promise<QuoteDataResultBody>((resolve, reject) => {
      this.request.get({
        uri: endpoints.quotes,
        qs: { symbols: symbol.toUpperCase(), statistics: true }
      }, (err, _, body) => {
        if (err) {
          return reject(err);
        }

        return resolve(body);
      });
    });
  }

  statistics(symbol: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      return this.request.get({
        uri: 'https://api.robinhood.com/stats/',
        qs: { symbols: symbol.toUpperCase() }
      }, (err, _, body) => {
        if (err) {
          return reject(err);
        }
        resolve(body);
      });
    });
  }

  user(): Promise<any> {
    return this.get(endpoints.user);
  }

  dividends(): Promise<any> {
    return this.get(endpoints.dividends);
  }

  orders(): Promise<OrderResponseBody> {
    return this.get(endpoints.orders);
  }

  positions(): Promise<any> {
    return this.get(endpoints.positions);
  }

  applications(): Promise<any> {
    return this.get(endpoints.applications);
  }

  portfolios(): Promise<any> {
    return this.get(endpoints.portfolios);
  }

  watchlists(): Promise<any> {
    return this.get(endpoints.watchlists);
  }

  document_requests(): Promise<any> {
    return this.get(endpoints.document_requests);
  }

  fundamentals(symbol: string): Promise<FundamentalResponse> {
    return this.get(`${endpoints.fundamentals}${symbol}/`);
  }

  market(symbol: string): Promise<any> {
    return this.get(`${endpoints.markets}${symbol}/`);
  }

  async getPricesForSymbols(symbols: string[]): Promise<{ symbol: string, price: number }[]> {
    const result = await this.get(endpoints.root(`/quotes/?symbols=${symbols.join(',')}`));
    return result && result.results && result.results.filter((r: any) => r && r.symbol && r.last_trade_price).map((r: any) => {
      return {
        symbol: r.symbol,
        price: parseFloat(r.last_trade_price)
      };
    });
  }

  async getPriceBySymbol(symbol: string): Promise<number> {
    const instruments = await this.instruments(symbol);
    if (instruments.results.length === 0) {
      throw new Error(`No results from instruments for symbol: ${symbol}`);
    }
    const quoteDataResponse = await this.quote_data(symbol);
    const quoteData = this.getCorrectForSymbol(symbol, quoteDataResponse.results);
    return parseFloat(quoteData.last_trade_price);
  }

  getCorrectForSymbol<T>(symbol: string, arr: T[]): T {
    if (!arr || arr.length === 0) {
      return undefined as any;
    }
    else if (arr.length === 1) {
      return arr[0];
    }
    else {
      const res = arr.filter(a => (a as any).symbol === symbol);
      if (res.length > 0) {
        return res[0];
      }
      else {
        return arr[0];
      }
    }
  }

  async placeOrder(symbol: string, quantity: number, transaction: string): Promise<number> {
    const form: OrderForm = {
      account: this.account,
      quantity: quantity,
      side: transaction,
      symbol: symbol.toUpperCase(),
      time_in_force: 'gfd',
      trigger: 'immediate',
      type: 'market',
      instrument: null as any,
      price: undefined as any
    };

    const b1 = await this.instruments(symbol);
    if (b1.results.length === 0) {
      return undefined as any;
    }
    let instrument = b1.results[0];
    if (b1.results.length > 1) {
      let newResult = b1.results.find((result: any) => result.symbol === symbol);

      if (newResult) {
        instrument = newResult;
      }
    }

    form.instrument = instrument.url;
    const body = await this.quote_data(symbol);
    const quoteData = body.results[0];
    form.price = parseFloat(quoteData.last_trade_price);
    if (form.price > 0.9) {
      form.price = parseFloat(form.price.toFixed(2));
    }
    console.log(`Requesting ${quantity} ${symbol} stocks at $${form.price}`);
    const body3 = await this.post({
      uri: endpoints.orders,
      form
    });
    if (body3 && body3.detail && body3.detail.indexOf('You can only purchase ') !== -1) {
      const newQuantity = parseFloat(body3.detail.replace(/You can only purchase (\d+).*/, '$1'));
      return await this.placeOrder(symbol, newQuantity, transaction);
    }
    else {
      return form.price;
    }
  }

  buy(symbol: string, quantity: number): Promise<number> {
    return this.placeOrder(symbol, quantity, 'buy');
  }

  sell(symbol: string, quantity: number): Promise<number> {
    return this.placeOrder(symbol, quantity, 'sell');
  }
}

export interface QuoteDataResultBody {
  results: QuoteDataResult[];
}
export interface QuoteDataResult {
  ask_price: string;
  ask_size: string;
  bid_price: string;
  bid_size: number;
  last_trade_price: string;
  last_extended_hours_trade_price: string;
  previous_close: string;
  adjusted_previous_close: string;
  previous_close_date: string;
  symbol: string;
  trading_halted: boolean;
  updated_at: string;

  //Delete these fields
  instrument?: string;
}

export interface FundamentalResponse {
  open: string;
  high: string;
  low: string;
  volume: string;
  average_volume: string;
  high_52_weeks: string;
  dividend_yield: string;
  low_52_weeks: string;
  market_cap: string;
  pe_ratio: string;

  //Delete these fields
  description?: string;
  instrument?: string;
}

export interface OrderResponseBody {
  results: Order[];
  next: string;
}

export interface Order {
  updated_at: string;
  time_in_force: string;
  fees: string;
  id: string;
  cumulative_quantity: string;
  instrument: string;
  state: string; //filled
  trigger: string; //immediate
  type: string; //market
  last_transaction_at: string; //Date
  price: string; //number
  executions: any[];
  account: string;
  url: string;
  created_at: string;
  side: string; //buy or sell
  position: string;
  average_price: string;
  quantity: string;
}

type OrderForm = {
  account: string,
  instrument: string,
  symbol: string,
  type: string,
  time_in_force: string,
  trigger: string,
  price: number,
  stop_price?: number,
  quantity: number,
  side: string
};

export interface PositionResult {
  account: string; //url
  intraday_quantity: string;
  shares_held_for_sells: string;
  url: string;
  created_at: string;
  updated_at: string;
  shares_held_for_buys: string;
  average_buy_price: string;
  instrument: string;
  quantity: string;
}

export interface InstrumentResult {
  splits: string; //url
  margin_initial_ratio: string;
  url: string;
  quote: string; //url
  symbol: string;
  bloomberg_unique: string;
  list_date: string;
  fundamentals: string; //url
  state: string;
  tradeable: boolean;
  maintenance_ratio: string;
  id: string;
  market: string; //url
  name: string;
}