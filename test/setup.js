// test/setup.js
import { should, use } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

should();

export default chai.request.execute;
