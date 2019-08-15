const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Packing Endpoints', () => {
  let db;
  const { testUsers, testPackingItems } = helpers.makeTravelFixtures();
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect form db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/list', () => {
    context('Given no items', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      );
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given items in database', () => {
      beforeEach('insert items', () => 
        helpers.seedPackingTable(
          db,
          testUsers,
          testPackingItems
        )
      );
      it('responds with 200 and all the items', () => {
        const expectedItems = testPackingItems.filter(items => items.user_id === testUsers[0].id);
        return supertest(app)
          .get('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body).to.not.have.property('date_created');
            expect(res.body).to.not.have.property('user_id');
            expect(res.body.id).to.eql(expectedItems.id);
            expect(res.body.item).to.eql(expectedItems.item);
          });
      });
    });
  });

  describe('POST /api/list', () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    );

    it('creates an item, responds with 201 and new item', () => { 
      const newItem = {
        item: 'New test Item'
      };
      return supertest(app)
        .post('/api/list')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body.item).to.eql(newItem.item);
          expect(res.body).to.have.property('id');
        })
        .then(postRes => {
          supertest(app)
            .get('/api/list')
            .expect(postRes.body);
        });
    });
  });

  describe.skip('DELETE /api/list/:id');

  describe.skip('PATCH /api/list/:id');
});