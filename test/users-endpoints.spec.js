const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', () => {
  let db;
  const { testUsers } = helpers.makeTravelFixtures();
  const testUser = testUsers[0];

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

  describe('POST /api/users', () => {
    context ('User Validation', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      );

      const requiredFields = ['username', 'password'];
      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test username',
          password: 'test password'
        };
        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, { error: `Missing ${field} in request body`});
        });
      });

      it('repsonds 400 "Password must be longer than 8 characters" when empty password', () => {
        const userShortPassword = {
          username: 'test username',
          password: '1234567'
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, {error: 'Password must be longer than 8 characters' });
      });

      it('responds 400 "Password must be less than 72 characters" when long password', () => {
        const userLongPassword = {
          username: 'test username',
          password: '*'.repeat(73)
        };
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: 'Password must be less than 72 characters' });
      });

      it('responds 400 error when password starts with spaces', () => {
        const userPasswordStartSpace = {
          username: 'test username',
          password: ' 1Aa!2Bb@'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartSpace)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password ends with spaces', () => {
        const userPasswordEndSpace = {
          username: 'test username',
          password: '1Aa!2Bb@ '
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndSpace)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password is not complex enough', () => {
        const userPasswordNotComplex = {
          username: 'test username',
          password: '12345678'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: 'Password must contain 1 upper case, lower case, number, and special character' });
      });

      it('responds 400 "Username already taken" when username is not unique', () => {
        const duplicateUser = {
          username: testUser.username,
          password: '11AAaa!!'
        };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: 'Username already taken' });
      });

      it('reponds 400 error when username starts with spaces', () => {
        const usernameStartSpace = {
          username: ' test username',
          password: '1Aa!2Bb@'
        };
        return supertest(app)
          .post('/api/users')
          .send(usernameStartSpace)
          .expect(400, { error: 'Username must not start or end with empty spaces' });
      });

      it('reponds 400 error when username ends with spaces', () => {
        const usernameEndSpace = {
          username: 'test username ',
          password: '1Aa!2Bb@'
        };
        return supertest(app)
          .post('/api/users')
          .send(usernameEndSpace)
          .expect(400, { error: 'Username must not start or end with empty spaces' });
      });
    });
  });

  context('Happy path', () => {
    it('responds 201, serialized user, storing bcrypted password', () => {
      const newUser = {
        username: 'test username',
        password: '11AAaa!!'
      };
      const date = new Date();
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.username).to.eql(newUser.username);
          expect(res.body).to.not.have.property('password');
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          const expectedDate = new Date();
          const actualDate = new Date(res.body.date_created);
          expect(actualDate).to.be.within(date, expectedDate);
        })
        .expect(res => 
          db
            .from('users')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.username).to.eql(newUser.username);
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
              const actualDate = new Date(row.date_created).toLocaleString('en', { timeZone: 'UTC' });
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });
  });
});