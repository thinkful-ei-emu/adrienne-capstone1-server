const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Transportation Endpoints', () => {
  let db;

  const { testUsers, testTransportItems } = helpers.makeTravelFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/travel', () => {
    context('Given no items', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      );
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/travel')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given items', () => {
      beforeEach('insert items', () => 
        helpers.seedTransportTable(
          db,
          testUsers,
          testTransportItems
        )
      );
      it('responds with 200 and all of the items from logged in user', () => {
        const expectedItems = testTransportItems.filter(items => items.user_id === testUsers[0].id);
        return supertest(app)
          .get('/api/travel')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body).to.not.have.property('user_id');
            expect(res.body).to.not.have.property('date_created');
            expect(res.body.id).to.eql(expectedItems.id);
            expect(res.body.transport_date).to.eql(expectedItems.transport_date);
            expect(res.body.transport_time).to.eql(expectedItems.transport_time);
            expect(res.body.transport_location).to.eql(expectedItems.transport_location);
            expect(res.body.destination).to.eql(expectedItems.destination);
            expect(res.body.transport_type).to.eql(expectedItems.transport_type);
            expect(res.body.transport_number).to.eql(expectedItems.transport_number);
          });
      });
    });
  });

  describe('POST /api/travel', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(
        db,
        testUsers
      )
    );
  
    it('creates an item, responds with 201 and new item', () => { 
      const newItem = {
        transport_date: '2019-10-31',
        transport_time: '16:28:32.615Z',
        transport_location: 'New test location',
        destination: 'New test destination',
        transport_type: 'Boat',
        transport_number: 'twop2tq20',
      };
      return supertest(app)
        .post('/api/travel')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body.transport_date).to.eql(newItem.transport_date);
          expect(res.body.transport_time).to.eql(newItem.transport_time);
          expect(res.body.transport_location).to.eql(newItem.transport_location);
          expect(res.body.destination).to.eql(newItem.destination);
          expect(res.body.transport_type).to.eql(newItem.transport_type);
          expect(res.body.transport_number).to.eql(newItem.transport_number);
        })
        .then(postRes => 
          supertest(app)
            .get('/api/travel')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(postRes.body)
        );
    });
  });

  describe('DELETE /api/travel/:id', () => {
    context('Given items', () => {
      beforeEach('insert items', () => 
        helpers.seedTransportTable(
          db,
          testUsers,
          testTransportItems
        )
      );

      it('responds with 204 and removes the item', () => {
        const idToRemove = 2;
        const expectedItems = testTransportItems.filter(item => item.id !== idToRemove);
        console.log('expected items', expectedItems);
        return supertest(app)
          .delete(`/api/travel/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/api/travel')
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedItems)
          );
      });
    });
  });

  describe.skip('PATCH /api/travel/:id');
});
