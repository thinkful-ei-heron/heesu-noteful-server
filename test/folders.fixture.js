function makeFoldersArray() {
  return [
    {
      id: 1,
      name: 'First test post!',
      date_created: '2019-11-11T16:28:32.615Z'
    },
    {
      id: 2,
      name: 'Second test post!',
      date_created: '2019-11-09T16:28:32.615Z'
    },
    {
      id: 3,
      name: 'Third test post!',
      date_created: '2019-11-10T16:28:32.615Z'
    },
  ];
};

function makeMaliciousFolder() {
  const maliciousFolders = {
    id: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    
  }
  const expectedFolders = {
    ...maliciousFolders,
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousFolders,
    expectedFolders,
  }
};

module.exports = {
  makeFoldersArray,
  makeMaliciousFolder
};



