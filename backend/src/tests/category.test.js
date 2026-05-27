// tests/category.test.js
import { expect } from "chai";
import sinon from "sinon";

import Zone from "../models/zone.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

import {
  getAllCategories,
  getCategoryById,
  getAllCategoriesTicket,
  getCategoryByIdTicket,
  fetchCategories,
} from "../controllers/category.controller.js";

import { mockReq, mockRes, mockChain } from "./helpers.js";

describe("Category Controller", () => {
  afterEach(() => sinon.restore());

  describe("getAllCategories", () => {
    it("returns enriched categories with productCount and zoneName", async () => {
      sinon
        .stub(Category, "find")
        .resolves([
          { _id: "c1", name: "Fruits", zoneid: "z1", description: "d" },
        ]);
      sinon.stub(Product, "countDocuments").resolves(7);
      sinon.stub(Zone, "findById").returns(mockChain({ name: "Cold Zone" }));

      const res = mockRes();
      await getAllCategories(mockReq({ query: {} }), res);

      const out = res.json.firstCall.args[0];
      expect(out).to.have.lengthOf(1);
      expect(out[0]).to.include({
        id: "c1",
        name: "Fruits",
        productCount: 7,
        zoneName: "Cold Zone",
      });
    });

    it('falls back to "Unknown" zoneName when zone missing', async () => {
      sinon
        .stub(Category, "find")
        .resolves([{ _id: "c1", name: "X", zoneid: "zX", description: "" }]);
      sinon.stub(Product, "countDocuments").resolves(0);
      sinon.stub(Zone, "findById").returns(mockChain(null));

      const res = mockRes();
      await getAllCategories(mockReq({ query: {} }), res);
      expect(res.json.firstCall.args[0][0].zoneName).to.equal("Unknown");
    });

    it("applies zoneid filter when provided in query", async () => {
      const findStub = sinon.stub(Category, "find").resolves([]);
      const res = mockRes();
      await getAllCategories(mockReq({ query: { zoneid: "z1" } }), res);
      expect(findStub.calledWith({ zoneid: "z1" })).to.be.true;
    });

    it("returns 500 on Category.find error", async () => {
      sinon.stub(Category, "find").rejects(new Error("fail"));
      const res = mockRes();
      await getAllCategories(mockReq({ query: {} }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getCategoryById", () => {
    it("returns 404 when not found", async () => {
      sinon.stub(Category, "findById").resolves(null);
      const res = mockRes();
      await getCategoryById(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("returns enriched category when found", async () => {
      sinon.stub(Category, "findById").resolves({
        _id: "c1",
        name: "Fruits",
        zoneid: "z1",
        description: "",
      });
      sinon.stub(Product, "countDocuments").resolves(3);
      sinon.stub(Zone, "findById").returns(mockChain({ name: "Z" }));

      const res = mockRes();
      await getCategoryById(mockReq({ params: { id: "c1" } }), res);
      expect(res.json.firstCall.args[0]).to.include({
        id: "c1",
        name: "Fruits",
        productCount: 3,
        zoneName: "Z",
      });
    });
  });

  describe("getAllCategoriesTicket", () => {
    it("returns all categories when no zoneid filter", async () => {
      sinon.stub(Category, "find").resolves([
        { _id: { toString: () => "c1" }, name: "A" },
        { _id: { toString: () => "c2" }, name: "B" },
      ]);
      const res = mockRes();
      await getAllCategoriesTicket(mockReq({ query: {} }), res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal([
        { id: "c1", name: "A" },
        { id: "c2", name: "B" },
      ]);
    });

    it("filters categories via products when zoneid given", async () => {
      sinon.stub(Product, "find").resolves([
        { categoryid: { toString: () => "c1" } },
        { categoryid: { toString: () => "c1" } }, // duplicate to test Set dedup
      ]);
      sinon
        .stub(Category, "find")
        .resolves([{ _id: { toString: () => "c1" }, name: "A" }]);
      const res = mockRes();
      await getAllCategoriesTicket(mockReq({ query: { zoneid: "z1" } }), res);
      expect(res.json.firstCall.args[0]).to.deep.equal([
        { id: "c1", name: "A" },
      ]);
    });
  });

  describe("getCategoryByIdTicket", () => {
    it("returns formatted category", async () => {
      sinon.stub(Category, "findById").resolves({
        _id: { toString: () => "c1" },
        name: "Fruits",
      });
      const res = mockRes();
      await getCategoryByIdTicket(mockReq({ params: { id: "c1" } }), res);
      expect(res.json.firstCall.args[0]).to.deep.equal({
        id: "c1",
        name: "Fruits",
      });
    });

    it("returns 404 when category missing", async () => {
      sinon.stub(Category, "findById").resolves(null);
      const res = mockRes();
      await getCategoryByIdTicket(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // ── fetchCategories (supplier) ────────────────────────────
  describe("fetchCategories", () => {
    it("returns categories with suppliers via aggregate", async () => {
      sinon
        .stub(Category, "aggregate")
        .resolves([
          { _id: "c1", name: "Dairy", suppliers: [{ _id: "s1", name: "S1" }] },
        ]);
      const res = mockRes();
      await fetchCategories(
        mockReq({
          query: {
            zoneid: new (
              await import("mongoose")
            ).default.Types.ObjectId().toString(),
          },
        }),
        res,
      );
      expect(res.status.calledWith(200)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out).to.have.lengthOf(1);
      expect(out[0]).to.have.property("id", "c1");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Category, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await fetchCategories(mockReq({ query: { zoneid: "z1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getCategoryById error ─────────────────────────────────
  describe("getCategoryById (error)", () => {
    it("returns 500 on DB error", async () => {
      sinon.stub(Category, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await getCategoryById(mockReq({ params: { id: "c1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getAllCategoriesTicket error ───────────────────────────
  describe("getAllCategoriesTicket (error)", () => {
    it("returns 500 on error", async () => {
      sinon.stub(Product, "find").rejects(new Error("fail"));
      const res = mockRes();
      await getAllCategoriesTicket(mockReq({ query: { zoneid: "z1" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getCategoryByIdTicket error ───────────────────────────
  describe("getCategoryByIdTicket (error)", () => {
    it("returns 500 on error", async () => {
      sinon.stub(Category, "findById").rejects(new Error("fail"));
      const res = mockRes();
      await getCategoryByIdTicket(mockReq({ params: { id: "x" } }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
