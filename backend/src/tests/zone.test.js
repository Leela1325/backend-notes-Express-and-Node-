// tests/zone.test.js
import { expect } from "chai";
import sinon from "sinon";

import Zone from "../models/zone.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

import getAllZones, {
  getZoneById,
  getZoneCapacityStatus,
  getZoneStatus,
  enrichZone,
  getAllZonesTicket,
  getZoneByIdTicket,
  fetchZones,
  fetchZone,
} from "../controllers/zone.controller.js";

import { mockReq, mockRes } from "./helpers.js";

describe("Zone Controller", () => {
  afterEach(() => sinon.restore());

  // ---------- Pure helpers ----------

  describe("getZoneStatus (pure helper)", () => {
    it('returns "Full" when available <= 0', () => {
      expect(getZoneStatus(0, 1000)).to.equal("Full");
      expect(getZoneStatus(-5, 1000)).to.equal("Full");
    });

    it('returns "Nearly Full" at >= 90% fill', () => {
      // 100 available out of 1000 max => 90% filled
      expect(getZoneStatus(100, 1000)).to.equal("Nearly Full");
      expect(getZoneStatus(50, 1000)).to.equal("Nearly Full");
    });

    it('returns "Available" when fill < 90%', () => {
      expect(getZoneStatus(500, 1000)).to.equal("Available");
      expect(getZoneStatus(1000, 1000)).to.equal("Available");
    });
  });

  describe("enrichZone (pure helper)", () => {
    it("shapes zone correctly with counts and status", () => {
      const zone = {
        _id: { toString: () => "z1" },
        name: "Cold",
        maxcapacity: 1000,
        currentcapacity: 200,
      };
      const out = enrichZone(zone, 3, 25);
      expect(out).to.include({
        id: "z1",
        name: "Cold",
        maxcapacity: 1000,
        currentcapacity: 200,
        availablecapacity: 800,
        categoryCount: 3,
        productCount: 25,
        status: "Available",
      });
    });
  });

  // ---------- Route handlers ----------

  describe("getAllZones", () => {
    it("returns 200 with enriched zones", async () => {
      sinon.stub(Zone, "find").resolves([
        {
          _id: { toString: () => "z1" },
          name: "Z1",
          maxcapacity: 1000,
          currentcapacity: 100,
        },
        {
          _id: { toString: () => "z2" },
          name: "Z2",
          maxcapacity: 500,
          currentcapacity: 450,
        },
      ]);
      sinon.stub(Category, "countDocuments").resolves(2);
      sinon.stub(Product, "countDocuments").resolves(10);

      const res = mockRes();
      await getAllZones(mockReq(), res);

      expect(res.status.calledWith(200)).to.be.true;
      const sent = res.send.firstCall.args[0];
      expect(sent).to.have.lengthOf(2);
      expect(sent[0].categoryCount).to.equal(2);
      expect(sent[0].productCount).to.equal(10);
      // 50/500 left = 90% filled => Nearly Full
      expect(sent[1].status).to.equal("Nearly Full");
    });

    it("returns 500 when Zone.find throws", async () => {
      sinon.stub(Zone, "find").rejects(new Error("boom"));
      const res = mockRes();
      await getAllZones(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getZoneById", () => {
    it("returns 404 when zone not found", async () => {
      sinon.stub(Zone, "findById").resolves(null);
      const res = mockRes();
      await getZoneById(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("returns 200 with enriched zone", async () => {
      sinon.stub(Zone, "findById").resolves({
        _id: { toString: () => "z1" },
        name: "Cold",
        maxcapacity: 1000,
        currentcapacity: 300,
      });
      sinon.stub(Category, "countDocuments").resolves(1);
      sinon.stub(Product, "countDocuments").resolves(5);

      const res = mockRes();
      await getZoneById(mockReq({ params: { id: "z1" } }), res);

      expect(res.status.calledWith(200)).to.be.true;
      const out = res.send.firstCall.args[0];
      expect(out).to.include({
        id: "z1",
        name: "Cold",
        categoryCount: 1,
        productCount: 5,
      });
    });
  });

  describe("getZoneCapacityStatus", () => {
    it('returns a "Full" message when zone is full', async () => {
      sinon.stub(Zone, "findById").resolves({
        _id: "z1",
        name: "A",
        maxcapacity: 100,
        currentcapacity: 100,
      });
      const res = mockRes();
      await getZoneCapacityStatus(mockReq({ params: { id: "z1" } }), res);
      const out = res.json.firstCall.args[0];
      expect(out.status).to.equal("Full");
      expect(out.message).to.include("is full");
    });

    it("returns null message when zone has room", async () => {
      sinon.stub(Zone, "findById").resolves({
        _id: "z1",
        name: "A",
        maxcapacity: 100,
        currentcapacity: 10,
      });
      const res = mockRes();
      await getZoneCapacityStatus(mockReq({ params: { id: "z1" } }), res);
      expect(res.json.firstCall.args[0].message).to.equal(null);
    });

    it("returns 404 when zone missing", async () => {
      sinon.stub(Zone, "findById").resolves(null);
      const res = mockRes();
      await getZoneCapacityStatus(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe("getAllZonesTicket", () => {
    it("returns minimal {id,name} list", async () => {
      sinon.stub(Zone, "find").resolves([
        { _id: { toString: () => "z1" }, name: "A" },
        { _id: { toString: () => "z2" }, name: "B" },
      ]);
      const res = mockRes();
      await getAllZonesTicket(mockReq(), res);
      expect(res.json.firstCall.args[0]).to.deep.equal([
        { id: "z1", name: "A" },
        { id: "z2", name: "B" },
      ]);
    });
  });

  describe("getZoneByIdTicket", () => {
    it("returns 404 when zone missing", async () => {
      sinon.stub(Zone, "findById").resolves(null);
      const res = mockRes();
      await getZoneByIdTicket(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("returns formatted zone when found", async () => {
      sinon.stub(Zone, "findById").resolves({
        _id: { toString: () => "z1" },
        name: "Cold",
      });
      const res = mockRes();
      await getZoneByIdTicket(mockReq({ params: { id: "z1" } }), res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({
        id: "z1",
        name: "Cold",
      });
    });

    it("returns 500 on error", async () => {
      sinon.stub(Zone, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await getZoneByIdTicket(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── fetchZones (supplier) ─────────────────────────────────
  describe("fetchZones", () => {
    it("returns zones with categories and suppliers via aggregate", async () => {
      sinon.stub(Zone, "aggregate").resolves([
        {
          _id: "z1",
          name: "Cold",
          maxcapacity: 100,
          currentcapacity: 50,
          categories: [{ _id: "c1", name: "Dairy" }],
          suppliers: [{ _id: "s1", name: "S1" }],
        },
      ]);
      const res = mockRes();
      await fetchZones(mockReq(), res);
      expect(res.status.calledWith(201)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out).to.have.lengthOf(1);
      expect(out[0]).to.have.property("id", "z1");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Zone, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await fetchZones(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── fetchZone ─────────────────────────────────────────────
  describe("fetchZone", () => {
    it("returns zone data for a given zoneid", async () => {
      sinon.stub(Zone, "findById").resolves({ _id: "z1", name: "Cold" });
      const res = mockRes();
      await fetchZone(mockReq({ params: { zoneid: "z1" } }), res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("returns 500 on error", async () => {
      sinon.stub(Zone, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await fetchZone(mockReq({ params: { zoneid: "z1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getAllZonesTicket error ────────────────────────────────
  describe("getAllZonesTicket (error)", () => {
    it("returns 500 on error", async () => {
      sinon.stub(Zone, "find").rejects(new Error("fail"));
      const res = mockRes();
      await getAllZonesTicket(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getZoneById error ─────────────────────────────────────
  describe("getZoneById (error)", () => {
    it("returns 500 on DB error", async () => {
      sinon.stub(Zone, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await getZoneById(mockReq({ params: { id: "z1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getZoneCapacityStatus error ───────────────────────────
  describe("getZoneCapacityStatus (error + nearly full)", () => {
    it("returns 500 on error", async () => {
      sinon.stub(Zone, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await getZoneCapacityStatus(mockReq({ params: { id: "z1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });

    it('returns "Nearly Full" warning message', async () => {
      sinon.stub(Zone, "findById").resolves({
        _id: "z1",
        name: "A",
        maxcapacity: 100,
        currentcapacity: 95,
      });
      const res = mockRes();
      await getZoneCapacityStatus(mockReq({ params: { id: "z1" } }), res);
      expect(res.json.firstCall.args[0].status).to.equal("Nearly Full");
      expect(res.json.firstCall.args[0].message).to.include("Warning");
    });
  });
});
