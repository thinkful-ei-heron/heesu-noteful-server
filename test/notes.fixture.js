function makeNotesArray() {
  return [
    {
      id: 1,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folderId: 1,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    },
    {
      id: 2,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folderId: 2,
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    },
    {
      id: 3,
      name: 'First test post!',
      modified: '2029-01-22T16:28:32.615Z',
      folderId: 3,
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit, consectetur adipisicing elit.medium',
    },
  ];
};

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    name: 'How-to',
    modified: new Date().toISOString(),
    folderId: 1,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedArticle = {
    ...maliciousArticle,
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousArticle,
    expectedArticle,
  }
};

module.exports = {
  makeNotesArray,
  makeMaliciousNote
};



