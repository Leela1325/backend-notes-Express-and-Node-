// tests/activity.test.js
import { expect } from 'chai';
import sinon from 'sinon';

import { Activity } from '../models/activity.model.js';
import { logActivity } from '../controllers/activity.controller.js';

import { mockReq, mockRes } from './helpers.js';

describe('Activity Controller', () => {
  afterEach(() => sinon.restore());

  describe('logActivity', () => {
    it('returns 201 with success message when insertOne resolves', async () => {
      sinon.stub(Activity, 'insertOne').resolves();
      const req = mockReq({ body: { eventname: 'Test', eventdesc: 'd' } });
      const res = mockRes();

      await logActivity(req, res);

      expect(Activity.insertOne.calledOnceWithExactly(req.body)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ message: 'Successfully added' })).to.be.true;
    });

    it('returns 500 when insertOne rejects', async () => {
      sinon.stub(Activity, 'insertOne').rejects(new Error('DB down'));
      const res = mockRes();

      await logActivity(mockReq({ body: {} }), res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message', 'DB down');
    });
  });
});
