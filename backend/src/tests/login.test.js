// tests/login.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import login from '../controllers/login.controller.js';

import { mockReq, mockRes } from './helpers.js';

describe('Login Controller', () => {
  beforeEach(() => { process.env.mySecretKey = 'test-secret'; });
  afterEach(() => sinon.restore());

  it('returns 200 with token + user when credentials are valid', async () => {
    sinon.stub(User, 'findOne').resolves({
      name: 'Gautham', email: 'g@x.com', password: 'hashedpw', role: 'admin',
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').returns('fake.jwt.token');

    const res = mockRes();
    await login(mockReq({ body: { email: 'G@X.COM ', password: 'plain' } }), res);

    // Verifies email is normalized (trim + lowercase) before lookup
    expect(User.findOne.firstCall.args[0]).to.deep.equal({ email: 'g@x.com' });
    expect(res.status.calledWith(200)).to.be.true;
    const body = res.send.firstCall.args[0];
    expect(body.token).to.equal('fake.jwt.token');
    expect(body.user).to.deep.equal({ name: 'Gautham', email: 'g@x.com', role: 'admin' });
  });

  it('returns 400 when password mismatches', async () => {
    sinon.stub(User, 'findOne').resolves({
      name: 'x', email: 'a@b.com', password: 'h', role: 'staff',
    });
    sinon.stub(bcrypt, 'compare').resolves(false);
    const res = mockRes();
    await login(mockReq({ body: { email: 'a@b.com', password: 'wrong' } }), res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.firstCall.args[0]).to.deep.equal({ msg: 'invalid credentials' });
  });

  it('returns 400 when user does not exist', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const res = mockRes();
    await login(mockReq({ body: { email: 'no@one.com', password: 'p' } }), res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('returns 500 when DB lookup throws', async () => {
    sinon.stub(User, 'findOne').rejects(new Error('mongo error'));
    const res = mockRes();
    await login(mockReq({ body: { email: 'a@b.com', password: 'p' } }), res);
    expect(res.status.calledWith(500)).to.be.true;
  });

  it('signs JWT with name, email, role and 2h expiry', async () => {
    sinon.stub(User, 'findOne').resolves({
      name: 'G', email: 'g@x.com', password: 'h', role: 'admin',
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    const signStub = sinon.stub(jwt, 'sign').returns('tok');

    const res = mockRes();
    await login(mockReq({ body: { email: 'g@x.com', password: 'p' } }), res);

    expect(signStub.calledOnce).to.be.true;
    expect(signStub.firstCall.args[0]).to.deep.equal({
      name: 'G', email: 'g@x.com', role: 'admin',
    });
    expect(signStub.firstCall.args[2]).to.deep.equal({ expiresIn: '2h' });
  });
});
