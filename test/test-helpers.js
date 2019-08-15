const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      username: 'test-user-3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      username: 'test-user-4',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 5,
      username: 'test-user-5',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ];
}

function makePackingArray(users) {
  return [
    {
      date_created: '2029-01-22T16:28:32.615Z',
      id: 1,
      user_id: users[0].id,
      item: 'first item'
    },
    {
      date_created: '2029-01-22T16:28:32.615Z',
      id: 2,
      user_id: users[1].id,
      item: 'second item'
    },
    {
      date_created: '2029-01-22T16:28:32.615Z',
      id: 3,
      user_id: users[2].id,
      item: 'third item'
    },
    {
      date_created: '2029-01-22T16:28:32.615Z',
      id: 4,
      user_id: users[3].id,
      item: 'fourth item'
    },
    {
      date_created: '2029-01-22T16:28:32.615Z',
      id: 5,
      user_id: users[4].id,
      item: 'fifth item'
    }
  ];
}

function makeTransportationArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      transport_date: '2029-01-22',
      transport_time: '16:28:32.615Z',
      transport_location: 'test location',
      destination: 'test destination',
      transport_type: 'Plane',
      transport_number: 'qo932t02',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      user_id: users[1].id,
      transport_date: '2029-01-22',
      transport_time: '16:28:32.615Z',
      transport_location: 'test location',
      destination: 'test destination',
      transport_type: 'Plane',
      transport_number: 'qo932t02',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      user_id: users[2].id,
      transport_date: '2029-01-22',
      transport_time: '16:28:32.615Z',
      transport_location: 'test location',
      destination: 'test destination',
      transport_type: 'Plane',
      transport_number: 'qo932t02',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      user_id: users[3].id,
      transport_date: '2029-01-22',
      transport_time: '16:28:32.615Z',
      transport_location: 'test location',
      destination: 'test destination',
      transport_type: 'Plane',
      transport_number: 'qo932t02',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 5,
      user_id: users[4].id,
      transport_date: '2029-01-22',
      transport_time: '16:28:32.615Z',
      transport_location: 'test location',
      destination: 'test destination',
      transport_type: 'Plane',
      transport_number: 'qo932t02',
      date_created: '2029-01-22T16:28:32.615Z'
    },
  ];
}

function makeExpectedPackingItem(users, packingItem) {
  const user = users.find(user => user.id === packingItem.user_id);
  return {
    id: packingItem.id,
    user_id: user.id,
    item: packingItem.item,
    date_created: packingItem.date_created
  };
}

function makeExpectedTransportItem(users, transportItem) {
  const user = users.find(user => user.id === transportItem.user_id);
  return {
    id: transportItem.id,
    user_id: user.id,
    transport_date: transportItem.transport_date,
    transport_time: transportItem.transport_time,
    transport_location: transportItem.transport_location,
    destination: transportItem.destination,
    transport_type: transportItem.transport_type,
    transport_number: transportItem.transport_number,
    date_created: transportItem.date_created
  };
}

function makeMaliciousTransportItem(user) {
  const maliciousItem = {
    id: 1,
    user_id: user.id,
    transport_date: '2029-01-22',
    transport_time: '16:28:32.615Z',
    transport_location: 'normal looking location <script>alert("xss");</script>',
    destination: 'malicious destination <script>alert("xss");</script>',
    transport_type: 'Plane',
    transport_number: 'malicious number qo932t02 <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
    date_created: new Date().toISOString()
  };
  const expectedItem = {
    ...makeExpectedTransportItem([user], maliciousItem),
    transport_location: 'normal looking location &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    destination: 'malicious destination &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    transport_number: 'malicious number qo932t02 <img src="https://url.to.file.which/does-not.exist">'
  };
  return {
    maliciousItem,
    expectedItem
  }
}

function makeMaliciousPackingItem(user) {
  const maliciousItem = {
    id: 1,
    user_id: user.id,
    item: 'normal looking item <script>alert("xss");</script>', 
    date_created: new Date().toISOString()
  };
  const expectedItem = {
    ...makeExpectedPackingItem([user], maliciousItem),
    item: 'normal looking item &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  };
  return {
    maliciousItem,
    expectedItem
  }
}

function makeAuthHeader(user, secret=process.env.JWT_SECRET) {
  const token = jwt.sign({ id: user.id}, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

function makeTravelFixtures() {
  const testUsers = makeUsersArray();
  const testPackingItems = makePackingArray(testUsers);
  const testTransportItems = makeTransportationArray(testUsers);
  return { testUsers, testPackingItems, testTransportItems };
}

function cleanTables(db) {
  return db.transaction(trx => 
    trx.raw(
      `TRUNCATE
        users,
        packing_list,
        transportation
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE packing_list_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE transportation_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
        trx.raw(`SELECT setval('packing_list_id_seq', 0)`),
        trx.raw(`SELECT setval('transportation_id_seq', 0)`),
      ])
    )
    )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    )
}

function seedPackingTable(db, users, packingList) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('packing_list').insert(packingList)
    await trx.raw(
      `SELECT setval('packing_list_id_seq', ?)`,
      [packingList[packingList.length - 1].id]
    )
  })
}

function seedTransportTable(db, users, transportList) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('transportation').insert(transportList)
    await trx.raw(
      `SELECT setval('transportation_id_seq', ?)`,
      [transportList[transportList.length - 1].id]
    )
  })
}

function seedMaliciousPackingItem(db, user, packingItem) {
  return seedUsers(db, [user])
    .then(() => 
    db
      .into('packing_list')
      .insert(packingItem)
    )
}

function seedMaliciousTransportItem(db, user, transportItem) {
  return seedUsers(db, [user])
  .then(() => 
  db
    .into('transportation')
    .insert(transportItem)
  )
}

module.exports = {
  makeUsersArray,
  makePackingArray,
  makeTransportationArray,
  makeExpectedPackingItem,
  makeExpectedTransportItem,
  makeMaliciousTransportItem,
  makeMaliciousPackingItem,
  makeAuthHeader,
  makeTravelFixtures,
  cleanTables,
  seedUsers,
  seedPackingTable,
  seedTransportTable,
  seedMaliciousPackingItem,
  seedMaliciousTransportItem
};