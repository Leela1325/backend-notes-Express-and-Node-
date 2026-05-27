// tests/sales.test.js
import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import { Sales } from "../models/sales.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import Zone from "../models/zone.model.js";
import { Activity } from "../models/activity.model.js";
import { Ticket } from "../models/ticket.model.js";

import {
  getAllSales,
  getSalesFormData,
  createSale,
  CategoryPerformers,
  getallCategories,
  getallProducts,
  getDailyUnitsByCategory,
  getDailySalesByCategory,
  getProductOverview,
  getDailySalesByProduct,
  getDailyCategorySales,
  getProductPerformance,
} from "../controllers/sales.controller.js";

import { mockReq, mockRes, oid } from "./helpers.js";

describe("Sales Controller", () => {
  afterEach(() => sinon.restore());

  // ── getAllSales ──────────────────────────────────────────────
  describe("getAllSales", () => {
    it("returns 200 with formatted sales", async () => {
      const populateStub = sinon.stub().resolves([
        {
          _id: { toString: () => "s1" },
          productid: { toString: () => "p1" },
          productname: "Apple",
          categoryid: { _id: { toString: () => "c1" }, name: "Fruits" },
          quantity: 10,
          avgprice: 5,
          timestamp: new Date(),
        },
      ]);
      const sortStub = sinon.stub().returns({
        populate: sinon.stub().returns({
          sort: sinon.stub().resolves([
            {
              _id: { toString: () => "s1" },
              productid: { toString: () => "p1" },
              productname: "Apple",
              categoryid: { _id: { toString: () => "c1" }, name: "Fruits" },
              quantity: 10,
              avgprice: 5,
              timestamp: new Date(),
            },
          ]),
        }),
      });

      // Simpler approach: stub find to return chainable
      const fakeChain = {
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().resolves([
          {
            _id: { toString: () => "s1" },
            productid: { toString: () => "p1" },
            productname: "Apple",
            categoryid: { _id: { toString: () => "c1" }, name: "Fruits" },
            quantity: 10,
            avgprice: 5,
            timestamp: new Date(),
          },
        ]),
      };
      sinon.stub(Sales, "find").returns(fakeChain);

      const res = mockRes();
      await getAllSales(mockReq(), res);
      expect(res.status.calledWith(200)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out).to.have.lengthOf(1);
      expect(out[0].productname).to.equal("Apple");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "find").throws(new Error("fail"));
      const res = mockRes();
      await getAllSales(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getSalesFormData ────────────────────────────────────────
  describe("getSalesFormData", () => {
    it("returns zones, categories and products", async () => {
      sinon
        .stub(Zone, "find")
        .resolves([{ _id: { toString: () => "z1" }, name: "Z1" }]);
      sinon
        .stub(Category, "find")
        .resolves([{ _id: { toString: () => "c1" }, name: "C1" }]);
      sinon.stub(Product, "aggregate").resolves([
        {
          _id: { toString: () => "p1" },
          name: "Apple",
          zoneid: { toString: () => "z1" },
          categoryid: { toString: () => "c1" },
          price: 10,
          inventory: [{ quantity: 5 }],
          zone: [{ name: "Z1" }],
          category: [{ name: "C1" }],
        },
      ]);

      const res = mockRes();
      await getSalesFormData(mockReq(), res);
      expect(res.status.calledWith(200)).to.be.true;
      const out = res.json.firstCall.args[0];
      expect(out.zones).to.have.lengthOf(1);
      expect(out.categories).to.have.lengthOf(1);
      expect(out.products).to.have.lengthOf(1);
      expect(out.products[0].totalQuantity).to.equal(5);
    });

    it("returns 500 on error", async () => {
      sinon.stub(Zone, "find").rejects(new Error("fail"));
      const res = mockRes();
      await getSalesFormData(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── createSale ──────────────────────────────────────────────
  describe("createSale", () => {
    it("returns 400 when productname missing", async () => {
      const res = mockRes();
      await createSale(mockReq({ body: { quantity: 5 } }), res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns 400 when quantity <= 0", async () => {
      const res = mockRes();
      await createSale(
        mockReq({ body: { productname: "A", quantity: 0 } }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns 404 when product not found", async () => {
      sinon.stub(Product, "findOne").resolves(null);
      const res = mockRes();
      await createSale(
        mockReq({ body: { productname: "A", quantity: 5 } }),
        res,
      );
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("returns 400 when insufficient stock", async () => {
      sinon.stub(Product, "findOne").resolves({
        _id: "p1",
        name: "A",
        inventory: [{ quantity: 2, expirydate: "2030-01-01", price: 10 }],
        price: 10,
      });
      const res = mockRes();
      await createSale(
        mockReq({ body: { productname: "A", quantity: 5 } }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });
  });

  // ── CategoryPerformers ─────────────────────────────────────
  describe("CategoryPerformers", () => {
    it("returns 400 for invalid category id", async () => {
      const res = mockRes();
      await CategoryPerformers(
        mockReq({ params: { categoryid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns aggregated data on success", async () => {
      sinon
        .stub(Sales, "aggregate")
        .resolves([
          { productId: oid(), productName: "A", category: oid(), value: 100 },
        ]);
      const res = mockRes();
      await CategoryPerformers(
        mockReq({
          params: { categoryid: oid().toString() },
          query: { days: "7", type: "best" },
        }),
        res,
      );
      expect(res.send.calledOnce).to.be.true;
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await CategoryPerformers(
        mockReq({ params: { categoryid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getallCategories ───────────────────────────────────────
  describe("getallCategories", () => {
    it("returns categories with name and _id", async () => {
      const fakeChain = {
        select: sinon.stub().resolves([{ _id: "c1", name: "Fruits" }]),
      };
      sinon.stub(Category, "find").returns(fakeChain);
      const res = mockRes();
      await getallCategories(mockReq(), res);
      expect(res.json.calledOnce).to.be.true;
    });

    it("returns 500 on error", async () => {
      sinon.stub(Category, "find").throws(new Error("fail"));
      const res = mockRes();
      await getallCategories(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getallProducts ─────────────────────────────────────────
  describe("getallProducts", () => {
    it("returns products", async () => {
      const fakeChain = {
        select: sinon.stub().resolves([{ _id: "p1", name: "Apple" }]),
      };
      sinon.stub(Product, "find").returns(fakeChain);
      const res = mockRes();
      await getallProducts(mockReq(), res);
      expect(res.json.calledOnce).to.be.true;
    });

    it("returns 500 on error", async () => {
      sinon.stub(Product, "find").throws(new Error("fail"));
      const res = mockRes();
      await getallProducts(mockReq(), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getDailyUnitsByCategory ────────────────────────────────
  describe("getDailyUnitsByCategory", () => {
    it("returns 400 for invalid category id", async () => {
      const res = mockRes();
      await getDailyUnitsByCategory(
        mockReq({ params: { categoryid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns dates and sales arrays on success", async () => {
      sinon.stub(Sales, "aggregate").resolves([]);
      const res = mockRes();
      await getDailyUnitsByCategory(
        mockReq({
          params: { categoryid: oid().toString() },
          query: { days: "3" },
        }),
        res,
      );
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("dates");
      expect(out).to.have.property("sales");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await getDailyUnitsByCategory(
        mockReq({ params: { categoryid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getDailySalesByCategory ────────────────────────────────
  describe("getDailySalesByCategory", () => {
    it("returns 400 for invalid category id", async () => {
      const res = mockRes();
      await getDailySalesByCategory(
        mockReq({ params: { categoryid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns dates and revenue on success", async () => {
      sinon.stub(Sales, "aggregate").resolves([]);
      const res = mockRes();
      await getDailySalesByCategory(
        mockReq({
          params: { categoryid: oid().toString() },
          query: { days: "3" },
        }),
        res,
      );
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("dates");
      expect(out).to.have.property("revenue");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await getDailySalesByCategory(
        mockReq({ params: { categoryid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getProductOverview ─────────────────────────────────────
  describe("getProductOverview", () => {
    it("returns 400 for invalid product id", async () => {
      const res = mockRes();
      await getProductOverview(
        mockReq({ params: { productid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns overview with revenue and units", async () => {
      sinon.stub(Sales, "aggregate").resolves([
        {
          current: [{ revenue: 500, unitsSold: 50 }],
          previous: [{ revenue: 300, unitsSold: 30 }],
        },
      ]);
      const res = mockRes();
      await getProductOverview(
        mockReq({
          params: { productid: oid().toString() },
          query: { days: "7" },
        }),
        res,
      );
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("revenue");
      expect(out).to.have.property("unitsSold");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await getProductOverview(
        mockReq({ params: { productid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getDailySalesByProduct ─────────────────────────────────
  describe("getDailySalesByProduct", () => {
    it("returns 400 for invalid product id", async () => {
      const res = mockRes();
      await getDailySalesByProduct(
        mockReq({ params: { productid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns dates and quantity on success", async () => {
      sinon.stub(Sales, "aggregate").resolves([]);
      const res = mockRes();
      await getDailySalesByProduct(
        mockReq({
          params: { productid: oid().toString() },
          query: { days: "3" },
        }),
        res,
      );
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("dates");
      expect(out).to.have.property("quantity");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await getDailySalesByProduct(
        mockReq({ params: { productid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getDailyCategorySales ──────────────────────────────────
  describe("getDailyCategorySales", () => {
    it("returns dates and series on success", async () => {
      sinon
        .stub(Sales, "aggregate")
        .resolves([
          { _id: { day: "2026-05-20", category: "Fruits" }, units: 10 },
        ]);
      const res = mockRes();
      await getDailyCategorySales(mockReq({ query: { days: "3" } }), res);
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("dates");
      expect(out).to.have.property("series");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Sales, "aggregate").rejects(new Error("fail"));
      const res = mockRes();
      await getDailyCategorySales(mockReq({ query: {} }), res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ── getProductPerformance ──────────────────────────────────
  describe("getProductPerformance", () => {
    it("returns 400 for invalid product id", async () => {
      const res = mockRes();
      await getProductPerformance(
        mockReq({ params: { productid: "bad" }, query: {} }),
        res,
      );
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("returns performance data on success", async () => {
      const pid = oid();
      const fakeChain = {
        select: sinon
          .stub()
          .returns({ lean: sinon.stub().resolves({ name: "Apple" }) }),
      };
      sinon.stub(Product, "findById").returns(fakeChain);
      sinon.stub(Sales, "aggregate").resolves([
        {
          monthly: [{ _id: 1, revenue: 100, units: 10 }],
          heatmap: [{ _id: { month: 1, dow: 1 }, units: 5 }],
        },
      ]);
      const res = mockRes();
      await getProductPerformance(
        mockReq({ params: { productid: pid.toString() }, query: {} }),
        res,
      );
      const out = res.json.firstCall.args[0];
      expect(out).to.have.property("productName");
      expect(out).to.have.property("revenue");
      expect(out).to.have.property("heatmap");
    });

    it("returns 500 on error", async () => {
      sinon.stub(Product, "findById").throws(new Error("fail"));
      const res = mockRes();
      await getProductPerformance(
        mockReq({ params: { productid: oid().toString() }, query: {} }),
        res,
      );
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
