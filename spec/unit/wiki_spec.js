const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("Wiki", () => {

  beforeEach((done) => {
    this.wiki;
    this.user;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe",
        confirmationCode: "dasdfasdfasdfasdfsdf",
        wikis: [{
             title: "Pros of Cryosleep during the long journey",
             body: "1. Not having to answer the 'are we there yet?' question.",
             private: 0
           }]
         }, {
           include: {
            model: Wiki,
            as: "wikis"
           }
         })
      .then((user) => {
        this.user = user; //store the user
        this.wiki = user.wikis[0];
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("#create()", () => {

    it("should create a wiki object with a title, body, and user", (done) => {
 //#1
        Wiki.create({
          title: "Pros of Cryosleep during the long journey",
          body: "1. Not having to answer the 'are we there yet?' question.",
          private: 0,
          userId: this.user.id
        })
        .then((wiki) => {

 //#2
          expect(wiki.title).toBe("Pros of Cryosleep during the long journey");
          expect(wiki.body).toBe("1. Not having to answer the 'are we there yet?' question.");
          expect(wiki.userId).toBe(this.user.id);
          done();

        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });

      it("should not create a wiki with missing title, body, or assigned user", (done) => {
        Wiki.create({
          title: "Pros of Cryosleep during the long journey"
        })
        .then((wiki) => {

         // the code in this block will not be evaluated since the validation error
         // will skip it. Instead, we'll catch the error in the catch block below
         // and set the expectations there

          done();

        })
        .catch((err) => {

          expect(err.message).toContain("Wiki.body cannot be null");
          expect(err.message).toContain("Wiki.userId cannot be null");
          done();

        })
      });

    });

  describe("#setUser()", () => {

    it("should associate a wiki and a user together", (done) => {

      User.create({
        email: "ada@example.com",
        password: "password",
        confirmationCode: "asdfasdfasdfasdfasdf"
      })
      .then((newUser) => {

        expect(this.wiki.userId).toBe(this.user.id);

        this.wiki.setUser(newUser)
        .then((wiki) => {

          expect(this.wiki.userId).toBe(newUser.id);
          done();

        });
      })
    });

  });

  describe("#getUser()", () => {

    it("should return the associated user", (done) => {

      this.wiki.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      });

    });

  });

});
