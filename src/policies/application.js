module.exports = class ApplicationPolicy {

 // #1
  constructor(user, record, collaborators=null) {
    this.user = user;
    this.record = record;
    this.collaborators = collaborators;
  }

 // #2
  _isOwner() {
    return this.record && (this.record.userId === this.user.id);
  }

  _isPremium() {
    return this.user && this.user.role === 1;
  }

  _isAdmin() {
    return this.user && this.user.role === 2;
  }

  _isCollaborator() {
    return this.collaborators.includes(this.user.id);
  }

 // #3
  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    return this.new() &&
      this.record && (this._isOwner() || this._isAdmin());
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}
