// tests/middleware.test.js
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";

import authentication from "../middlewares/authentication.middleware.js";
import authorize from "../middlewares/authorization.middleware.js";
import { handleSupplierRoute } from "../middlewares/supplier.middleware.js";

import { mockReq, mockRes } from "./helpers.js";

describe("Middleware", () => {
  beforeEach(() => {
    process.env.mySecretKey = "test-secret";
  });
  afterEach(() => sinon.restore());

  // ── Authentication ─────────────────────────────────────────
  describe("authentication", () => {
    it("calls next() and sets req.user when token is valid", () => {
      const payload = { name: "G", email: "g@x.com", role: "admin" };
      sinon.stub(jwt, "verify").returns(payload);
      const req = mockReq({ headers: { authorization: "Bearer valid.token" } });
      const res = mockRes();
      const next = sinon.spy();

      authentication(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(req.user).to.deep.equal(payload);
    });

    it("returns 401 when token is missing", () => {
      const req = mockReq({ headers: {} });
      const res = mockRes();
      const next = sinon.spy();

      authentication(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal({
        msg: "token missing",
      });
      expect(next.notCalled).to.be.true;
    });

    it("returns 401 when token is invalid", () => {
      sinon.stub(jwt, "verify").throws(new Error("invalid"));
      const req = mockReq({ headers: { authorization: "Bearer bad.token" } });
      const res = mockRes();
      const next = sinon.spy();

      authentication(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal({
        msg: "invalid credentials",
      });
    });
  });

  // ── Authorization ──────────────────────────────────────────
  describe("authorize", () => {
    it("calls next() when user role is allowed", () => {
      const middleware = authorize("admin", "manager");
      const req = mockReq();
      req.user = { role: "admin" };
      const res = mockRes();
      const next = sinon.spy();

      middleware(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it("returns 403 when user role is not allowed", () => {
      const middleware = authorize("admin");
      const req = mockReq();
      req.user = { role: "staff" };
      const res = mockRes();
      const next = sinon.spy();

      middleware(req, res, next);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal({
        msg: "Access denied",
      });
      expect(next.notCalled).to.be.true;
    });
  });

  // ── Supplier Middleware ────────────────────────────────────
  describe("handleSupplierRoute", () => {
    it("calls next() when both zoneid and categoryid are present", () => {
      const req = mockReq({ query: { zoneid: "z1", categoryid: "c1" } });
      const res = mockRes();
      const next = sinon.spy();

      handleSupplierRoute(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it("calls next() when no zoneid", () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const next = sinon.spy();

      handleSupplierRoute(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });
});
