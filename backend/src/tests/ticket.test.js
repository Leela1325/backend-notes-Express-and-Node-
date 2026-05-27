// tests/ticket.test.js
import { expect } from 'chai';
import sinon from 'sinon';

import Zone from '../models/zone.model.js';
import { Product } from '../models/product.model.js';
import { Ticket } from '../models/ticket.model.js';
import { Purchase } from '../models/purchase.model.js';
import { Activity } from '../models/activity.model.js';

import {
  getAllTickets,
  getTicketById,
  createTicket,
  patchTicket,
  approveTicket,
  disapproveTicket,
  checkLowStock,
} from '../controllers/ticket.controller.js';

import { mockReq, mockRes, oid } from './helpers.js';

describe('Ticket Controller', () => {
  afterEach(() => sinon.restore());

  describe('getAllTickets', () => {
    it('returns aggregated tickets, formatted', async () => {
      const productId = oid();
      const supplierId = oid();
      sinon.stub(Ticket, 'aggregate').resolves([
        {
          _id: oid(),
          productid: productId,
          productName: 'Apple',
          requestedQuantity: 50,
          status: 'PENDING',
          createdAt: new Date(),
          product: [{ _id: productId, name: 'Apple', price: 10, inventory: [], supplierids: [supplierId] }],
          suppliers: [{ _id: supplierId, name: 'S1', rating: 4 }],
        },
      ]);

      const res = mockRes();
      await getAllTickets(mockReq(), res);
      expect(res.status.calledWith(200)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out).to.have.lengthOf(1);
      expect(out[0].product.name).to.equal('Apple');
      expect(out[0].suppliers).to.have.lengthOf(1);
    });
  });

  describe('getTicketById', () => {
    it('returns 404 when no ticket found', async () => {
      sinon.stub(Ticket, 'aggregate').resolves([]);
      const res = mockRes();
      await getTicketById(mockReq({ params: { id: oid().toString() } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('returns 200 with formatted ticket when found', async () => {
      const productId = oid();
      const supplierId = oid();
      const ticketId = oid();
      sinon.stub(Ticket, 'aggregate').resolves([{
        _id: ticketId,
        productid: productId,
        productName: 'Apple',
        requestedQuantity: 50,
        status: 'PENDING',
        product: [{ _id: productId, name: 'Apple', price: 10, inventory: [], supplierids: [supplierId] }],
        suppliers: [{ _id: supplierId, name: 'S1', rating: 4 }],
      }]);
      const res = mockRes();
      await getTicketById(mockReq({ params: { id: ticketId.toString() } }), res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe('createTicket', () => {
    it('returns 400 when required fields missing', async () => {
      const res = mockRes();
      await createTicket(mockReq({ body: { productid: 'p1' } }), res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('returns 400 when requestedQuantity <= 0', async () => {
      const res = mockRes();
      await createTicket(
        mockReq({ body: { productid: 'p1', productName: 'Apple', requestedQuantity: 0 } }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('returns 404 when product not found', async () => {
      sinon.stub(Product, 'findById').resolves(null);
      const res = mockRes();
      await createTicket(
        mockReq({ body: { productid: 'p1', productName: 'Apple', requestedQuantity: 10 } }),
        res,
      );
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('returns 409 when zone is full', async () => {
      sinon.stub(Product, 'findById').resolves({ _id: 'p1', zoneid: 'z1' });
      sinon.stub(Zone, 'findById').resolves({
        _id: 'z1', name: 'Z', maxcapacity: 100, currentcapacity: 100,
      });
      const res = mockRes();
      await createTicket(
        mockReq({ body: { productid: 'p1', productName: 'Apple', requestedQuantity: 10 } }),
        res,
      );
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.firstCall.args[0].isFull).to.equal(true);
    });

    it('returns 409 when requested exceeds available space', async () => {
      sinon.stub(Product, 'findById').resolves({ _id: 'p1', zoneid: 'z1' });
      sinon.stub(Zone, 'findById').resolves({
        _id: 'z1', name: 'Z', maxcapacity: 100, currentcapacity: 95,
      });
      const res = mockRes();
      await createTicket(
        mockReq({ body: { productid: 'p1', productName: 'Apple', requestedQuantity: 50 } }),
        res,
      );
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.firstCall.args[0].isFull).to.equal(false);
      expect(res.json.firstCall.args[0].availablecapacity).to.equal(5);
    });

    it('creates ticket and returns 201 on success', async () => {
      const productId = oid();
      sinon.stub(Product, 'findById').resolves({ _id: productId, zoneid: 'z1' });
      sinon.stub(Zone, 'findById').resolves({
        _id: 'z1', name: 'Z', maxcapacity: 1000, currentcapacity: 100,
      });
      const ticketId = oid();
      sinon.stub(Ticket, 'create').resolves({
        _id: ticketId, productid: productId, productName: 'Apple',
        requestedQuantity: 10, status: 'PENDING', createdAt: new Date(),
      });

      const res = mockRes();
      await createTicket(
        mockReq({ body: { productid: productId.toString(), productName: 'Apple', requestedQuantity: 10 } }),
        res,
      );

      expect(res.status.calledWith(201)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out.productName).to.equal('Apple');
      expect(out.status).to.equal('PENDING');
    });
  });

  describe('patchTicket', () => {
    it('returns 404 when ticket not found', async () => {
      sinon.stub(Ticket, 'findByIdAndUpdate').resolves(null);
      const res = mockRes();
      await patchTicket(
        mockReq({ params: { id: oid().toString() }, body: { requestedQuantity: 25 } }),
        res,
      );
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('updates ticket successfully and returns 200', async () => {
      const ticketId = oid();
      sinon.stub(Ticket, 'findByIdAndUpdate').resolves({
        _id: ticketId, productid: oid(), productName: 'Apple',
        requestedQuantity: 25, status: 'PENDING',
      });
      const res = mockRes();
      await patchTicket(
        mockReq({ params: { id: ticketId.toString() }, body: { requestedQuantity: 25 } }),
        res,
      );
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe('approveTicket', () => {
    it('approves ticket, creates purchase, and logs activity', async () => {
      const productId = oid();
      const supplierId = oid();
      const ticketId = oid();

      sinon.stub(Ticket, 'aggregate').resolves([{
        _id: ticketId,
        requestedQuantity: 50,
        status: 'PENDING',
        productName: 'Apple',
        product: [{ _id: productId, supplierids: [supplierId], zoneid: 'z1' }],
        suppliers: [{ _id: supplierId, name: 'S', rating: 5 }],
      }]);
      sinon.stub(Zone, 'findById').resolves({
        _id: 'z1', name: 'Z', maxcapacity: 1000, currentcapacity: 100,
      });
      sinon.stub(Product, 'findByIdAndUpdate').resolves({});
      sinon.stub(Ticket, 'findByIdAndUpdate').resolves({
        _id: ticketId, productid: productId, productName: 'Apple',
        requestedQuantity: 50, status: 'APPROVED', supplierId,
      });
      sinon.stub(Purchase, 'create').resolves({});
      sinon.stub(Activity, 'create').resolves({});
      // Defensive stubs for syncZoneCapacity internals
      sinon.stub(Product, 'find').resolves([]);
      sinon.stub(Product, 'aggregate').resolves([]);
      sinon.stub(Zone, 'findByIdAndUpdate').resolves({});
      sinon.stub(Zone, 'updateOne').resolves({});

      const res = mockRes();
      await approveTicket(
        mockReq({ params: { id: ticketId.toString() }, body: { supplierId: supplierId.toString() } }),
        res,
      );

      expect(res.status.calledWith(200)).to.be.true;
      expect(Purchase.create.calledOnce).to.be.true;
      expect(Activity.create.calledOnce).to.be.true;
    });

    it('returns 404 when ticket not found', async () => {
      sinon.stub(Ticket, 'aggregate').resolves([]);
      const res = mockRes();
      await approveTicket(
        mockReq({ params: { id: oid().toString() }, body: { supplierId: oid().toString() } }),
        res,
      );
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('returns 400 when ticket already approved', async () => {
      const ticketId = oid();
      sinon.stub(Ticket, 'aggregate').resolves([{
        _id: ticketId, requestedQuantity: 50, status: 'APPROVED',
        product: [{ _id: oid(), supplierids: [oid()], zoneid: 'z1' }],
        suppliers: [{ _id: oid(), name: 'S', rating: 5 }],
      }]);
      const res = mockRes();
      await approveTicket(
        mockReq({ params: { id: ticketId.toString() }, body: { supplierId: oid().toString() } }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('returns 400 when supplierId missing from request body', async () => {
      const ticketId = oid();
      const productId = oid();
      const supplierId = oid();
      sinon.stub(Ticket, 'aggregate').resolves([{
        _id: ticketId, requestedQuantity: 50, status: 'PENDING', productName: 'Apple',
        product: [{ _id: productId, supplierids: [supplierId], zoneid: 'z1' }],
        suppliers: [{ _id: supplierId, name: 'S', rating: 5 }],
      }]);
      sinon.stub(Zone, 'findById').resolves({
        _id: 'z1', name: 'Z', maxcapacity: 1000, currentcapacity: 100,
      });
      const res = mockRes();
      await approveTicket(mockReq({ params: { id: ticketId.toString() }, body: {} }), res);
      expect(res.status.calledWith(400)).to.be.true;
    });
  });

  describe('disapproveTicket', () => {
    it('returns 404 if ticket not found', async () => {
      sinon.stub(Ticket, 'findById').resolves(null);
      const res = mockRes();
      await disapproveTicket(mockReq({ params: { id: oid().toString() } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('returns 400 if ticket already rejected', async () => {
      sinon.stub(Ticket, 'findById').resolves({ _id: oid(), status: 'REJECTED' });
      const res = mockRes();
      await disapproveTicket(mockReq({ params: { id: oid().toString() } }), res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('rejects ticket and logs activity', async () => {
      const ticketId = oid();
      sinon.stub(Ticket, 'findById').resolves({ _id: ticketId, status: 'PENDING' });
      sinon.stub(Ticket, 'findByIdAndUpdate').resolves({
        _id: ticketId, status: 'REJECTED',
      });
      const activitySpy = sinon.stub(Activity, 'create').resolves({});

      const res = mockRes();
      await disapproveTicket(mockReq({ params: { id: ticketId.toString() } }), res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(activitySpy.calledOnce).to.be.true;
    });
  });

  describe('checkLowStock', () => {
    it('creates tickets for products under threshold without existing pending tickets', async () => {
      sinon.stub(Product, 'find').resolves([
        { _id: oid(), name: 'Low', inventory: [{ quantity: 10 }] },  // below 50 -> create
        { _id: oid(), name: 'OK',  inventory: [{ quantity: 100 }] }, // above 50 -> skip
      ]);
      sinon.stub(Ticket, 'findOne').resolves(null); // no existing pending
      const createStub = sinon.stub(Ticket, 'create').resolves({});

      const res = mockRes();
      await checkLowStock(mockReq(), res);

      expect(createStub.callCount).to.equal(1);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.include('1 ticket');
    });

    it('skips products that already have pending tickets', async () => {
      sinon.stub(Product, 'find').resolves([
        { _id: oid(), name: 'Low', inventory: [{ quantity: 10 }] },
      ]);
      sinon.stub(Ticket, 'findOne').resolves({ _id: oid(), status: 'PENDING' });
      const createStub = sinon.stub(Ticket, 'create').resolves({});

      const res = mockRes();
      await checkLowStock(mockReq(), res);

      expect(createStub.notCalled).to.be.true;
      expect(res.json.firstCall.args[0].message).to.include('0 ticket');
    });
  });
});