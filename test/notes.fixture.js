function makeNotesArray() {
  return [
    {
      id: 1,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folder_id: 1,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    },
    {
      id: 2,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folder_id: 2,
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    },
    {
      id: 3,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folder_id: 3,
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit, consectetur adipisicing elit.medium',
    },
  ];
};

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    modified: new Date().toISOString(),
    folder_id: 1,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedNote = {
    ...maliciousNote,
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousNote,
    expectedNote,
  }
};

module.exports = {
  makeNotesArray,
  makeMaliciousNote
};



