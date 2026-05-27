// tests/dashboard.test.js
// Unit tests for all dashboard analytics controllers in src/controller/dashboard/

import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';

import Zone from '../models/zone.model.js';
import { Product } from '../models/product.model.js';
import { Activity } from '../models/activity.model.js';
import { Ticket } from '../models/ticket.model.js';
import { Sales } from '../models/sales.model.js';
import { Purchase } from '../models/purchase.model.js';

import expiringProducts             from '../controllers/dashboard/expiringProducts.controller.js';
import getCategoryDistrubitionByZoneId from '../controllers/dashboard/getCategoryDistributionByZoneId.js';
import productSummary                from '../controllers/dashboard/productSummary.controller.js';
import recentActivity                from '../controllers/dashboard/recentActivity.controller.js';
import salesSummary                  from '../controllers/dashboard/salesSummary.controller.js';
import stockInStockOut               from '../controllers/dashboard/stockInStockOut.controller.js';
import ticketSummary                 from '../controllers/dashboard/ticketSummary.controller.js';
import todaySales                    from '../controllers/dashboard/todaySalesSummary.controller.js';
import getZones                      from '../controllers/dashboard/zones.controller.js';
import zonesSummary                  from '../controllers/dashboard/zonesSummary.controller.js';

import { mockReq, mockRes, oid } from './helpers.js';

// Local helpers for chained-query stubs
const mockSortChain = (resolvedValue) => ({ sort: sinon.stub().resolves(resolvedValue) });
const mockLeanChain = (resolvedValue) => ({ lean: sinon.stub().resolves(resolvedValue) });

// Silence console output produced by controllers (console.log / console.error)
// so test output stays clean. Restored automatically after each test.
beforeEach(() => {
  sinon.stub(console, 'log');
  sinon.stub(console, 'error');
});
afterEach(() => sinon.restore());

// ========================================================================
// expiringProducts
// ========================================================================

describe('Dashboard: expiringProducts', () => {
  it('returns 400 when days is not a number', async () => {
    const res = mockRes();
    await expiringProducts(mockReq({ query: {} }), res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('returns 400 when days is negative', async () => {
    const res = mockRes();
    await expiringProducts(mockReq({ query: { days: '-3' } }), res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('returns 200 with count + expiringItems on success', async () => {
    sinon.stub(Product, 'aggregate').resolves([
      { name: 'Milk',  id: 'b1', expirydate: new Date(), quantity: 10 },
      { name: 'Bread', id: 'b2', expirydate: new Date(), quantity: 5  },
    ]);
    const res = mockRes();
    await expiringProducts(mockReq({ query: { days: '7' } }), res);

    expect(res.status.calledWith(200)).to.be.true;
    const out = res.json.firstCall.args[0];
    expect(out.count).to.equal(2);
    expect(out.expiringItems).to.have.lengthOf(2);
  });

  it('returns 500 when aggregate fails', async () => {
    sinon.stub(Product, 'aggregate').rejects(new Error('agg fail'));
    const res = mockRes();
    await expiringProducts(mockReq({ query: { days: '7' } }), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// getCategoryDistrubitionByZoneId  (note: typo carried from controller)
// ========================================================================

describe('Dashboard: getCategoryDistrubitionByZoneId', () => {
  it('returns 400 when zoneid is missing', async () => {
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: {} }), res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].msg).to.match(/zoneid is required/i);
  });

  it('returns 400 when zoneid format is invalid', async () => {
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: 'not-an-oid' } }), res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.firstCall.args[0].msg).to.match(/invalid zoneid/i);
  });

  it('returns 404 when zone does not exist', async () => {
    sinon.stub(Zone, 'exists').resolves(null);
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: oid().toString() } }), res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('returns empty array when zone has no stock', async () => {
    sinon.stub(Zone, 'exists').resolves({ _id: oid() });
    sinon.stub(Product, 'aggregate').resolves([]);
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: oid().toString() } }), res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal([]);
  });

  it('converts quantities to percentages, rounded to 1 decimal, sorted desc', async () => {
    sinon.stub(Zone, 'exists').resolves({ _id: oid() });
    sinon.stub(Product, 'aggregate').resolves([
      { categoryName: 'Dairy',     quantity: 30 },
      { categoryName: 'Bakery',    quantity: 60 },
      { categoryName: 'Beverages', quantity: 10 },
    ]);
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: oid().toString() } }), res);

    const out = res.json.firstCall.args[0];
    // 100 total => 60%, 30%, 10% sorted descending
    expect(out).to.deep.equal([
      { categoryName: 'Bakery',    percentage: 60 },
      { categoryName: 'Dairy',     percentage: 30 },
      { categoryName: 'Beverages', percentage: 10 },
    ]);
  });

  it('substitutes "Uncategorized" when category name is missing', async () => {
    sinon.stub(Zone, 'exists').resolves({ _id: oid() });
    sinon.stub(Product, 'aggregate').resolves([
      { categoryName: null, quantity: 50 },
    ]);
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: oid().toString() } }), res);
    expect(res.json.firstCall.args[0][0].categoryName).to.equal('Uncategorized');
  });

  it('returns 500 on aggregate error', async () => {
    sinon.stub(Zone, 'exists').resolves({ _id: oid() });
    sinon.stub(Product, 'aggregate').rejects(new Error('boom'));
    const res = mockRes();
    await getCategoryDistrubitionByZoneId(mockReq({ query: { zoneid: oid().toString() } }), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// productSummary
// ========================================================================

describe('Dashboard: productSummary', () => {
  it('returns aggregated product + quantity stats', async () => {
    sinon.stub(Product, 'aggregate').resolves([{ products: 120, quantity: 5_400 }]);
    const res = mockRes();
    await productSummary(mockReq(), res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ products: 120, quantity: 5_400 });
  });

  it('returns zero defaults when aggregate result is empty', async () => {
    sinon.stub(Product, 'aggregate').resolves([]);
    const res = mockRes();
    await productSummary(mockReq(), res);
    expect(res.json.firstCall.args[0]).to.deep.equal({ products: 0, quantity: 0 });
  });

  it('returns 500 on aggregate failure', async () => {
    sinon.stub(Product, 'aggregate').rejects(new Error('mongo down'));
    const res = mockRes();
    await productSummary(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// recentActivity
// ========================================================================

describe('Dashboard: recentActivity', () => {
  it('returns 200 with sorted activity list', async () => {
    const fakeData = [
      { eventname: 'Ticket Approved', timestamp: new Date() },
      { eventname: 'Ticket Rejected', timestamp: new Date() },
    ];
    sinon.stub(Activity, 'find').returns(mockSortChain(fakeData));

    const res = mockRes();
    await recentActivity(mockReq({ query: { days: '7' } }), res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ data: fakeData });
  });

  it('uses a 1-day cutoff window when days=1', async () => {
    const findStub = sinon.stub(Activity, 'find').returns(mockSortChain([]));
    const res = mockRes();
    await recentActivity(mockReq({ query: { days: '1' } }), res);

    expect(findStub.calledOnce).to.be.true;
    // first arg is the filter; should have timestamp.$gte set to a Date
    const filter = findStub.firstCall.args[0];
    expect(filter.timestamp.$gte).to.be.instanceOf(Date);
  });

  it('returns 500 when find throws', async () => {
    sinon.stub(Activity, 'find').throws(new Error('db error'));
    const res = mockRes();
    await recentActivity(mockReq({ query: { days: '7' } }), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// salesSummary
// ========================================================================

describe('Dashboard: salesSummary', () => {
  it('returns 400 when days is NaN', async () => {
    const res = mockRes();
    await salesSummary(mockReq({ query: {} }), res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('returns 400 when days <= 0', async () => {
    const res = mockRes();
    await salesSummary(mockReq({ query: { days: '0' } }), res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('returns dates + revenue arrays of length === days, all zeros when empty', async () => {
    sinon.stub(Sales, 'aggregate').resolves([]);
    const res = mockRes();
    await salesSummary(mockReq({ query: { days: '7' } }), res);

    const out = res.json.firstCall.args[0];
    expect(out.dates).to.have.lengthOf(7);
    expect(out.revenue).to.have.lengthOf(7);
    expect(out.revenue.every((v) => v === 0)).to.be.true;
  });

  it('returns 500 on aggregate failure', async () => {
    sinon.stub(Sales, 'aggregate').rejects(new Error('boom'));
    const res = mockRes();
    await salesSummary(mockReq({ query: { days: '7' } }), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// stockInStockOut
// ========================================================================

describe('Dashboard: stockInStockOut', () => {
  it('returns 7-day windows for stockIn, stockOut, dates (all zeros when no data)', async () => {
    sinon.stub(Purchase, 'aggregate').resolves([]);
    sinon.stub(Sales,    'aggregate').resolves([]);

    const res = mockRes();
    await stockInStockOut(mockReq(), res);

    const out = res.json.firstCall.args[0];
    expect(out.dates).to.have.lengthOf(7);
    expect(out.stockIn).to.have.lengthOf(7);
    expect(out.stockOut).to.have.lengthOf(7);
    expect(out.stockIn.every((v) => v === 0)).to.be.true;
    expect(out.stockOut.every((v) => v === 0)).to.be.true;
  });

  it('returns 500 when either aggregate fails', async () => {
    sinon.stub(Purchase, 'aggregate').rejects(new Error('purch fail'));
    sinon.stub(Sales,    'aggregate').resolves([]);
    const res = mockRes();
    await stockInStockOut(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// ticketSummary
// ========================================================================

describe('Dashboard: ticketSummary', () => {
  it('returns count + formatted pending tickets', async () => {
    const ticketDoc = (id, name) => ({
      _id: id,
      _doc: { _id: id, productName: name, status: 'PENDING' },
    });
    const t1 = ticketDoc('t1', 'Apple');
    const t2 = ticketDoc('t2', 'Banana');
    sinon.stub(Ticket, 'find').resolves([t1, t2]);

    const res = mockRes();
    await ticketSummary(mockReq(), res);

    expect(res.status.calledWith(200)).to.be.true;
    const out = res.json.firstCall.args[0];
    expect(out.count).to.equal(2);
    expect(out.tickets).to.have.lengthOf(2);
    expect(out.tickets[0]).to.include({ id: 't1', productName: 'Apple' });
  });

  it('returns 500 on find error', async () => {
    sinon.stub(Ticket, 'find').rejects(new Error('boom'));
    const res = mockRes();
    await ticketSummary(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// todaySales
// ========================================================================

describe('Dashboard: todaySales', () => {
  it('returns stats from aggregate result + today date', async () => {
    sinon.stub(Sales, 'aggregate').resolves([{ totalQuantity: 150, totalRevenue: 12_750 }]);
    const res = mockRes();
    await todaySales(mockReq(), res);

    const out = res.json.firstCall.args[0];
    expect(out.totalQuantity).to.equal(150);
    expect(out.totalRevenue).to.equal(12_750);
    expect(out.date).to.be.instanceOf(Date);
  });

  it('returns zero defaults when aggregate result is empty', async () => {
    sinon.stub(Sales, 'aggregate').resolves([]);
    const res = mockRes();
    await todaySales(mockReq(), res);

    const out = res.json.firstCall.args[0];
    expect(out.totalQuantity).to.equal(0);
    expect(out.totalRevenue).to.equal(0);
    expect(out.date).to.be.instanceOf(Date);
  });

  it('returns 500 on error', async () => {
    sinon.stub(Sales, 'aggregate').rejects(new Error('agg fail'));
    const res = mockRes();
    await todaySales(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// getZones
// ========================================================================

describe('Dashboard: getZones', () => {
  it('returns formatted zone list', async () => {
    sinon.stub(Zone, 'find').returns(mockLeanChain([
      { _id: { toString: () => 'z1' }, name: 'Cold Zone' },
      { _id: { toString: () => 'z2' }, name: 'Dry Zone'  },
    ]));

    const res = mockRes();
    await getZones(mockReq(), res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal([
      { id: 'z1', name: 'Cold Zone' },
      { id: 'z2', name: 'Dry Zone'  },
    ]);
  });

  it('returns 500 on find error', async () => {
    sinon.stub(Zone, 'find').returns({
      lean: sinon.stub().rejects(new Error('db error')),
    });
    const res = mockRes();
    await getZones(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});

// ========================================================================
// zonesSummary
// ========================================================================

describe('Dashboard: zonesSummary', () => {
  it('returns totals + computed available capacity', async () => {
    sinon.stub(Zone, 'aggregate').resolves([{
      totalZones: 4,
      totalMaximumCapacity: 10_000,
      totalCurrentCapacity: 3_500,
    }]);

    const res = mockRes();
    await zonesSummary(mockReq(), res);

    expect(res.status.calledWith(200)).to.be.true;
    const out = res.json.firstCall.args[0];
    expect(out).to.deep.equal({
      totalZones: 4,
      totalMaximumCapacity: 10_000,
      totalCurrentCapacity: 3_500,
      totalAvailableCapacity: 6_500,
    });
  });

  it('returns 500 on aggregate error', async () => {
    sinon.stub(Zone, 'aggregate').rejects(new Error('boom'));
    const res = mockRes();
    await zonesSummary(mockReq(), res);
    expect(res.status.calledWith(500)).to.be.true;
  });
});