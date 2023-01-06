const Language = require("./Language");
const Attachment = require("./Attachment");
module.exports = class QuestionGroup {
    #intQGId;
    #language;
    #strTitle;
    #strText;
    #attachments; // array of attachments
    constructor() {
        this.#intQGId = -1;
        this.#language = new Language();
        this.#strTitle = "";
        this.#strText = "";
        this.Attachment = [];
    }

    setIntQGId(intQGId) {
        this.#intQGId = intQGId;
    }
    getIntQGId() {
        return this.#intQGId;
    }

    setLanguage(language) {
        this.#language = language;
    }
    getLanguage() {
        return this.#language;
    }

    setStrTitle(strTitle) {
        this.#strTitle = strTitle;
    }
    getStrTitle() {
        return this.#strTitle;
    }

    setStrText(strText) {
        this.#strText = strText;
    }
    getStrText() {
        return this.#strText;
    }

    setAttachments(attachments) {
        this.#attachments = attachments
    }
    getAttachments() {
        return this.#attachments;
    }
}