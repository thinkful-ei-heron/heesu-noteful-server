const knex = require('knex');
const app = require('../src/app');
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixture');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixture');

describe('Notes Endpoints', function() {
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
  
  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    });

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert notes', () => {
        return db 
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    });

  });

  describe(`GET /api/notes/:folder_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const folder_id = 123456
        return supertest(app)
          .get(`/api/notes/${folder_id}`)
          .expect(404, { error: { 
            message: `Note doesn't exist` }
          })
      })
    });

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert notes', () => {
        return db 
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 200 and the specified notes', () => {
        const noteId = 2
        const expectedNotes = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNotes)
      });
    });

  });

  describe(`POST /api/notes`, () => {
    const testNotes = makeNotesArray();
    const testFolders = makeFoldersArray();

    beforeEach('insert notes', () => {
      return db 
        .into('folders')
        .insert(testFolders)
    })

    it(`creates notes, responding with 201 and the new note`, () => {
      const newNote = {
        name: 'Test new notes name',
        content: 'Test new notes content',
        folder_id: 3
      }
      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newNote.name)
          expect(res.body.content).to.eql(newNote.content)
          expect(res.body.folder_id).to.eql(newNote.folder_id)
        })
        
    });

    const requiredFields = ['name', 'content', 'folder_id'];

    requiredFields.forEach(field => {
      const newNote = {
        name: 'Test new notes name',
        content: 'Test new notes conent',
        folder_id: 1
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]

        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    });

  });

  describe(`DELETE /api/notes/:folder_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { 
            error: { 
              message: `Note doesn't exist` 
            }
          })
      })
    });

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert notes', () => {
        return db 
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectedNotes)
          )
      });
    })

  });

});



