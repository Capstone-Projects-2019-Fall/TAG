const { test } = QUnit;

QUnit.module( "Annotation", () => {
  test( "Contains Character At", function(assert) {
    let annotation = new Annotation({startPosition: 0, endPosition: 7}, "testing", "tests");
    assert.ok( annotation.containsCharacterAt(5), "Annotation with ranges 0-7 contains a word within range 5" );
    assert.ok( !annotation.containsCharacterAt(8), "Annotation with ranges 0-7 doesn't contain a word within range 8" );
  });
});

QUnit.module( "Document", () => {
  let annotation1 = new Annotation({startPosition: 0, endPosition: 5}, "anno1", "anno1");
  let annotation2 = new Annotation({startPosition: 100, endPosition: 105}, "anno2", "anno2");
  let annotation3 = new Annotation({startPosition: 250, endPosition: 255}, "anno3", "anno3");

  let docMock = new Doc("titleTest", "bodyTest");

  docMock.annotations.push(annotation1);
  docMock.annotations.push(annotation2);
  docMock.annotations.push(annotation3);

  test( "Get Annotation", function(assert) {
    assert.ok( docMock.getAnnotationsAtPos(0)[0] === annotation1, "Annotation 1 indexed successfully" );
    assert.ok( docMock.getAnnotationsAtPos(100)[0] === annotation2, "Annotation 2 indexed successfully" );
    assert.ok( docMock.getAnnotationsAtPos(250)[0] === annotation3, "Annotation 3 indexed successfully" );

    assert.ok( docMock.getAnnotationsAtPos(250) !== annotation2, "Indexed annotation is not an incorrect annotation" );
    assert.ok( docMock.getAnnotationsAtPos(100) !== annotation1, "Indexed annotation is not an incorrect annotation" );
    assert.ok( docMock.getAnnotationsAtPos(0) !== annotation3, "Indexed annotation is not an incorrect annotation" );
  });

  test( "Update Annotation List", function(assert) {
    docMock.updateAnnotationList(annotation3);
    assert.ok( !docMock.annotations.includes(annotation3), "Annotation list does not contain a removed annotation" );

    assert.ok( docMock.annotations.includes(annotation1), "Annotation list still contains an untouched annotation" );
    assert.ok( docMock.annotations.includes(annotation2), "Annotation list still contains an untouched annotation" );
  });
});

QUnit.module( "TAG Model", () => {
  QUnit.module( "Documents", () => {
    let docMock = new Doc("titleTest", "bodyTest");

    test("Add Document", function(assert) {
      let tag = new TagModel();
      assert.ok( tag.openDocs.length === 0, "Document list originally 0");
      tag.openDocs.push(docMock);
      assert.ok( tag.openDocs.length > 0, "Document list successfully has a nonzero amount of documents after .openDocs()" );
    });

    test("Set Current Document", function(assert) {
      let tag = new TagModel();
      assert.ok( tag.openDocs.length === 0, "No curent document" );
      tag.openDocs.push(docMock);
      tag.setCurrentDoc("titleTest");
      assert.ok( tag.currentDoc.title === "titleTest", "Successfully set current document" );
    });
  });

  QUnit.module( "Annotations", () => {
    let docMock = new Doc("titleTest", "lorem ipsum dolor sit amet norum dictum sera");
    let cat = new Category("testCat", "testColor");
    let expectedAnno = new Annotation({startPosition: 0, endPosition: 5}, "lorem", cat);

    test("Add Annotation", function(assert) {
      let tag = new TagModel();
      tag.currentCategory = cat;
      tag.addDoc(docMock);
      tag.currentDoc = docMock;

      assert.ok( tag.currentDoc.annotations.length === 0, "No current annotations" );
      tag.addAnnotation({startPosition: 0, endPosition: 5});
      assert.ok( tag.currentDoc.annotations.length > 0, "Successfully added an annotation" );

      assert.ok(tag.currentDoc.annotations[0].content === expectedAnno.content, "Annotation matches expected content value" );
      assert.ok(tag.currentDoc.annotations[0].name === expectedAnno.name, "Annotation matches expected label name value" );
      assert.ok(tag.currentDoc.annotations[0].color === expectedAnno.color, "Annotation matches expected label color value" );
    });

    test("Remove Annotation", function(assert) {
      let tag = new TagModel();
      tag.currentCategory = cat;
      tag.addDoc(docMock);
      tag.currentDoc = docMock;

      tag.currentDoc.annotations.push(expectedAnno);
      assert.ok( tag.currentDoc.annotations.length === 1, "There exists 1 annotation" );

      tag.removeAnnotation(expectedAnno);
      assert.ok( tag.currentDoc.annotations.length === 0, "There exists 0 annotations after removal" );
    });
  });

  QUnit.module( "Categories", () => {
    test("Add Category", function(assert) {
      let tag = new TagModel();
      let expectedAnno = new Category("testName", "testColor");
      assert.ok( tag.categories.length === 0, "There exists 0 categories" );

      tag.addCategory("testName", "testColor");

      assert.ok( tag.categories.length === 1, "There exists 1 category after .addCategory()" );
      assert.ok( tag.categories[0].name === expectedAnno.name, "Added category matches its expected name value" );
      assert.ok( tag.categories[0].color === expectedAnno.color, "Added category matches its expected color value" );
    });

    //TODO -- semi-unused function
    // test("Check Category", function(assert) {
    //   assert.ok( tag.checkCategory("testName") === 1); //this should === 0
    // });

    test("Rename Category", function(assert) {
      let tag = new TagModel();
      let docMock = new Doc("titleTest", "lorem ipsum dolor sit amet norum dictum sera");
      let cat = new Category("testCat", "testColor");

      tag.addDoc(docMock);
      tag.currentDoc = docMock;
      tag.addCategory("testing", "testColor");
      tag.currentCategory = cat;
      tag.addAnnotation({startPosition: 0, endPosition: 5});

      assert.ok( tag.categories.length === 1, "There exists just 1 category" );
      assert.ok( tag.categories[0].name === "testing", "Category name is what we expect it to be" );
      assert.ok( tag.currentCategory.name === "testCat", "Current category name is what we expect it to be" );

      //TODO -- ReferenceError: tagModel is not defined
      // tag.renameCategory("testing2");
      // assert.ok( tag.currentCategory === "testing2", "New category name matches expected value" );
    });

    //TODO -- Unused function
    //   test("Remove Category", function(assert) {
    //     assert.ok(true, "this test is fine");
    //   });
 });

  QUnit.module( "Colors", () => {
    let tag = new TagModel();
    let cat = new Category("testCat", "testColor");

    tag.categories.push(cat);
    tag.currentCategory = cat.name;

    test("Get Color", function(assert) {
      assert.ok( tag.categories.length === 1, "There exists just one category" );
      assert.ok( tag.getColor("testCat") === "testColor", "Color fetched matches expected value" );
    });

    test("Change Color", function(assert) {
      assert.ok( tag.categories.length === 1, "There exists just one category" );
      tag.changeColor("newColor");
      assert.ok( tag.getColor("testCat") === "newColor", "Color fetched matches expected value" );
    });
  });
});