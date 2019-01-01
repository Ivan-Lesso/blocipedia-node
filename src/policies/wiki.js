// #1
const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  createPrivate() {
    return (this._isAdmin() || this._isPremium())
  }

  edit() {
    if(this.record.private===true) return (this._isAdmin() || this._isOwner() || this._isCollaborator());
    else return this.create();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
  show() {
    if(this.record.private===true) return (this._isAdmin() || this._isOwner() || this._isCollaborator());
    else return true;
  }
}
