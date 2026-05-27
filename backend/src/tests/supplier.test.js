import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import { Supplier } from "../models/supplier.model.js";
import { Product } from "../models/product.model.js";
import { Purchase } from "../models/purchase.model.js";
import {
  addSupplier, updateSupplier, deleteSupplier, fetchSupplierById, updateSupplierRating,
  getAllSuppliersTicket, getSupplierByIdTicket, fetchSupplierByZoneid, fetchSuppliers,
  fetchOptimalSupplierList, fetchProductsByIds, mapSuppliersWithProduct, unMapSuppliersWithProduct,
  removeProductFromSuppliers, removeSupplierFromProducts, fetchProductsUsingSupplierId,
  getPurchaseQuantityBySupplier, getAllSuppliersPurchaseFeedback,
} from "../controllers/supplier.controller.js";
import { mockReq, mockRes } from "./helpers.js";

const oid = () => new mongoose.Types.ObjectId();
const stub = (model, method, val) => sinon.stub(model, method).resolves(val);
const stubReject = (model, method) => sinon.stub(model, method).rejects(new Error("fail"));
const expectStatus = (res, code) => expect(res.status.calledWith(code)).to.be.true;

describe("Supplier Controller", () => {
  afterEach(() => sinon.restore());

  it("addSupplier: success", async () => {
    const data = { name: "S1", email: "leela@gmail.com", zoneid: "z1", categoryid: "c1" };
    stub(Supplier, "insertOne"); 
    stub(Supplier, "findOne", { _id: "sup1", ...data });
    const res = mockRes(); 
    await addSupplier(mockReq({ body: data }), res);
    expectStatus(res, 201);
  });
  it("addSupplier: error", async () => {
    stubReject(Supplier, "insertOne");
    const res = mockRes(); 
    await addSupplier(mockReq({ body: {} }), res);
    expectStatus(res, 500);
  });

 
  it("fetchSupplierById: success", async () => {
    stub(Supplier, "findById", { _id: "sup1", name: "S1" });
    const res = mockRes(); 
    await fetchSupplierById(mockReq({ params: { supplierid: "sup1" } }), res);
    expect(res.json.firstCall.args[0]).to.have.property("id", "sup1");
  });
  it("fetchSupplierById: error", async () => {
    stubReject(Supplier, "findById");
    const res = mockRes();
     await fetchSupplierById(mockReq({ params: { supplierid: "sup1" } }), res);
    expectStatus(res, 500);
  });

  it("updateSupplier: success", async () => {
    stub(Supplier, "updateOne", { modifiedCount: 1 });
    const res = mockRes(); 
    await updateSupplier(mockReq({ params: { supplierid: "sup1" }, body: { rating: 4 } }), res);
    expectStatus(res, 204);
  });
  it("updateSupplier: error", async () => {
    stubReject(Supplier, "updateOne");
    const res = mockRes(); 
    await updateSupplier(mockReq({ params: { supplierid: "sup1" }, body: {} }), res);
    expectStatus(res, 500);
  });

  it("deleteSupplier: success", async () => {
    stub(Supplier, "deleteOne", { deletedCount: 1 });
    const res = mockRes(); await deleteSupplier(mockReq({ params: { supplierid: "sup1" } }), res);
    expectStatus(res, 204);
  });

  
  [[1, "Poor"], [2, "Average"], [3, "Good"], [4, "Very Good"], [5, "Excellent"]].forEach(([rating, performance]) => {
    it(`updateSupplierRating: ${rating} → ${performance}`, async () => {
      const s = stub(Supplier, "findByIdAndUpdate", {});
      const res = mockRes(); await updateSupplierRating(mockReq({ params: { supplierid: "sup1" }, body: { rating } }), res);
      expect(s.firstCall.args[1]).to.deep.equal({ rating, performance }); 
      expectStatus(res, 202);
    });
  });

  // Tickets

  it("getAllSuppliersTicket: success", async () => {
    stub(Supplier, "find", [{ _id: { toString: () => "s1" }, name: "S1", contact: "1", address: "A", performance: "Good", email: "e@x.com", zoneid: { toString: () => "z1" }, categoryid: { toString: () => "c1" }, active: true, rating: 4, productids: [{ toString: () => "p1" }] }]);
    const res = mockRes(); 
    await getAllSuppliersTicket(mockReq(), res);
    expect(res.json.firstCall.args[0][0].id).to.equal("s1");
  });

  // getSupplierByIdTicket
  it("getSupplierByIdTicket: 404", async () => {
    stub(Supplier, "findById", null);
    const res = mockRes(); await getSupplierByIdTicket(mockReq({ params: { id: "x" } }), res);
    expectStatus(res, 404);
  });
  it("getSupplierByIdTicket: success", async () => {
    stub(Supplier, "findById", { _id: { toString: () => "s1" }, name: "S1", contact: "1", address: "A", performance: "Good", email: "e@x.com", zoneid: { toString: () => "z1" }, categoryid: { toString: () => "c1" }, active: true, rating: 4, productids: [] });
    const res = mockRes(); await getSupplierByIdTicket(mockReq({ params: { id: "s1" } }), res);
    expectStatus(res, 200);
  });

 
  it("fetchSupplierByZoneid: success", async () => {
    stub(Supplier, "find", [{ _id: "s1" }]);
    const res = mockRes();
     await fetchSupplierByZoneid(mockReq({ query: { zoneid: "z1" } }), res);
    expectStatus(res, 201);
  });
  it("fetchSupplierByZoneid: error", async () => {
    stubReject(Supplier, "find");
    const res = mockRes(); 
    await fetchSupplierByZoneid(mockReq({ query: { zoneid: "z1" } }), res);
    expectStatus(res, 500);
  });

  // fetchSuppliers
  it("fetchSuppliers: success", async () => {
    stub(Supplier, "aggregate", [{ _id: "s1", products: [] }]);
    const res = mockRes(); 
    await fetchSuppliers(mockReq({ query: { zoneid: oid().toString(), categoryid: oid().toString() } }), res);
    expectStatus(res, 200);
  });
  it("fetchSuppliers: error", async () => {
    stubReject(Supplier, "aggregate");
    const res = mockRes(); await fetchSuppliers(mockReq({ query: { zoneid: "bad", categoryid: "bad" } }), res);
    expectStatus(res, 500);
  });

  //
  it("fetchOptimalSupplierList: success", async () => {
    stub(Product, "aggregate", [{ suppliers: [{ _id: "s1", rating: 5 }] }]);
    const res = mockRes(); await fetchOptimalSupplierList(mockReq({ query: { productid: oid().toString() } }), res);
    expectStatus(res, 201);
  });
  it("fetchOptimalSupplierList: error", async () => {
    stubReject(Product, "aggregate");
    const res = mockRes(); await fetchOptimalSupplierList(mockReq({ query: { productid: "bad" } }), res);
    expectStatus(res, 500);
  });


  it("fetchProductsByIds: success", async () => {
    stub(Product, "findById", { _id: "p1" });
    const res = mockRes(); await fetchProductsByIds(mockReq({ query: { ids: ["p1"] } }), res);
    expectStatus(res, 200);
  });
  it("fetchProductsByIds: error", async () => {
    stubReject(Product, "findById");
    const res = mockRes(); await fetchProductsByIds(mockReq({ query: { ids: ["p1"] } }), res);
    expectStatus(res, 500);
  });

  it("mapSuppliersWithProduct: success", async () => {
    stub(Product, "findByIdAndUpdate", {}); 
    stub(Supplier, "updateMany", {});
    const res = mockRes(); await mapSuppliersWithProduct(mockReq({ query: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 203);
  });
  it("mapSuppliersWithProduct: error", async () => {
    stubReject(Product, "findByIdAndUpdate");
    const res = mockRes(); 
    await mapSuppliersWithProduct(mockReq({ query: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 500);
  });


  it("unMapSuppliersWithProduct: success", async () => {
    stub(Product, "findByIdAndUpdate", {});
     stub(Supplier, "updateMany", {});
    const res = mockRes(); 
    await unMapSuppliersWithProduct(mockReq({ query: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 203);
  });
  it("unMapSuppliersWithProduct: error", async () => {
    stubReject(Product, "findByIdAndUpdate");
    const res = mockRes(); 
    await unMapSuppliersWithProduct(mockReq({ query: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 500);
  });

 
  it("removeProductFromSuppliers: success", async () => {
    stub(Supplier, "updateMany", {});
    const res = mockRes(); await removeProductFromSuppliers(mockReq({ body: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 202);
  });
  it("removeProductFromSuppliers: error", async () => {
    stubReject(Supplier, "updateMany");
    const res = mockRes(); await removeProductFromSuppliers(mockReq({ body: { productid: "p1", supplierids: ["s1"] } }), res);
    expectStatus(res, 500);
  });

  // removeSupplierFromProducts
  it("removeSupplierFromProducts: success", async () => {
    stub(Product, "updateMany", {});
    const res = mockRes(); await removeSupplierFromProducts(mockReq({ body: { productids: ["p1"], supplierid: "s1" } }), res);
    expectStatus(res, 202);
  });
  it("removeSupplierFromProducts: error", async () => {
    stubReject(Product, "updateMany");
    const res = mockRes(); await removeSupplierFromProducts(mockReq({ body: { productids: ["p1"], supplierid: "s1" } }), res);
    expectStatus(res, 500);
  });

  
  it("fetchProductsUsingSupplierId: success", async () => {
    stub(Product, "find", [{ _id: "p1" }]);
    const res = mockRes(); await fetchProductsUsingSupplierId(mockReq({ query: { supplierid: "s1" } }), res);
    expectStatus(res, 200);
  });
  it("fetchProductsUsingSupplierId: error", async () => {
    stubReject(Product, "find");
    const res = mockRes(); await fetchProductsUsingSupplierId(mockReq({ query: { supplierid: "s1" } }), res);
    expectStatus(res, 500);
  });

 
  it("getPurchaseQuantityBySupplier: success", async () => {
    const sid = oid(), pid = oid();
    stub(Product, "find", [{ _id: pid, supplierids: [sid] }]);
    stub(Purchase, "find", [{ productid: pid, quantity: 100 }]);
    const res = mockRes(); await getPurchaseQuantityBySupplier(mockReq({ query: { supplierids: sid.toString() } }), res);
    expectStatus(res, 200); expect(res.json.firstCall.args[0].success).to.be.true;
  });
  it("getPurchaseQuantityBySupplier: empty", async () => {
    stub(Product, "find", []); stub(Purchase, "find", []);
    const res = mockRes(); await getPurchaseQuantityBySupplier(mockReq({ query: { supplierids: oid().toString() } }), res);
    expect(res.json.firstCall.args[0].data).to.deep.equal([]);
  });
  it("getPurchaseQuantityBySupplier: error", async () => {
    stubReject(Product, "find");
    const res = mockRes(); await getPurchaseQuantityBySupplier(mockReq({ query: { supplierids: "x" } }), res);
    expectStatus(res, 500);
  });

  it("getAllSuppliersPurchaseFeedback: success", async () => {
    const sid = oid(), pid = oid();
    stub(Supplier, "find", [{ _id: sid, name: "S1", rating: 4, performance: "Good" }]);
    sinon.stub(Product, "find").resolves([{ _id: pid }]);
    sinon.stub(Purchase, "find").returns({ sort: sinon.stub().resolves([{ quantity: 100, timestamp: new Date() }]) });
    const res = mockRes();
     await getAllSuppliersPurchaseFeedback(mockReq({ query: { supplierids: sid.toString() } }), res);
    expectStatus(res, 200); expect(res.json.firstCall.args[0].data[0].name).to.equal("S1");
  });
  it("getAllSuppliersPurchaseFeedback: empty", async () => {
    const sid = oid();
    stub(Supplier, "find", [{ _id: sid, name: "S1", rating: 2, performance: "Poor" }]);
    sinon.stub(Product, "find").resolves([]);
    sinon.stub(Purchase, "find").returns({ sort: sinon.stub().resolves([]) });
    const res = mockRes(); 
    await getAllSuppliersPurchaseFeedback(mockReq({ query: { supplierids: sid.toString() } }), res);
    expect(res.json.firstCall.args[0].data[0].purchases).to.deep.equal([]);
  });
  it("getAllSuppliersPurchaseFeedback: error", async () => {
    stubReject(Supplier, "find");
    const res = mockRes(); 
    await getAllSuppliersPurchaseFeedback(mockReq({ query: { supplierids: "x" } }), res);
    expectStatus(res, 500);
  });
});