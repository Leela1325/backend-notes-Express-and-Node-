
import sinon from 'sinon';
import mongoose from 'mongoose';

export const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});
export const oid = () => new mongoose.Types.ObjectId();
export const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json   = sinon.stub().returns(res);
  res.send   = sinon.stub().returns(res);
  return res;
};
export const mockChain = (finalValue) => ({
  sort: sinon.stub().returnsThis(),
  limit: sinon.stub().returnsThis(),
  skip: sinon.stub().returnsThis(),
  populate: sinon.stub().returnsThis(),
  select: sinon.stub().returnsThis(),
  lean: sinon.stub().returnsThis(),
  exec: sinon.stub().resolves(finalValue),
  then: (resolve) => Promise.resolve(finalValue).then(resolve),
});

