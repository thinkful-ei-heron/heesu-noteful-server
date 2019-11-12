const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixture');

describe('Folders Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  });

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
  
  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    });

    context(`Given an XSS attack folders`, () => {
      const testFolders = makeFoldersArray();
      const { maliciousFolders, expectedFolders } = makeMaliciousFolder()

      beforeEach('insert malicious folders', () => {
        return db
          .into('folders')
          .then(() => {
            return db
              .into('folders')
              .insert([ maliciousFolders ])
          })
      })

      it('removes XSS attack name', () => {
        return supertest(app)
          .get(`/api/folders`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedFolders.name)
          })
      })
    });

  });

  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { 
            message: `Folders doesn't exist` }
          })
      })
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 200 and the specified folders', () => {
        const folderId = 2
        const expectedFolders = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolders)
      });
    });

    context(`Given an XSS attack folders`, () => {
      const testFolders = makeFoldersArray();
      const { maliciousFolders, expectedFolders } = makeMaliciousFolder()

      beforeEach('insert malicious folders', () => {
        return db
          .into('folders')
          .then(() => {
            return db
              .into('folders')
              .insert([ maliciousFolders ])
          })
      })

      it('removes XSS attack name', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolders.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedFolders.name)
          })
      })
    });

  });

  describe.only(`POST /api/folders`, () => {
    const testFolders = makeFoldersArray();
    beforeEach('insert malicious article', () => {
      return db
        .into('folders')
        .insert(testFolders)
    });

    it(`creates folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        name: 'Test new folder name'
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['name'];

    requiredFields.forEach(field => {
      const newFolder = {
        name: 'Test new folder name'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    });

    it('removes XSS attack content from response', () => {
      const { maliciousFolders, expectedFolders } = makeMaliciousFolder()
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolders)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedFolders.name)
        })
    });

  });

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { 
            error: { 
              message: `Folders doesn't exist` 
            }
          })
      })
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('folders')
              .insert(testFolders)
          })
      });

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders)
          )
      });
    })

  });

  describe(`PATCH /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { 
            message: `Folders doesn't exist` } 
          })
      })
    });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('folders')
              .insert(testFolders)
          })
      })

      it('responds with 204 and updates the folders', () => {
        const idToUpdate = 2
        const updateFolder = {
          name: 'updated folders name',
        }
        const expectedFolders = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        }
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolders)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'name'`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateFolder = {
          name: 'updated folders name',
        }
        const expectedFolders = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        }

        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send({
            ...updateFolder,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolders)
          )
      });
      
    });

  });

});



