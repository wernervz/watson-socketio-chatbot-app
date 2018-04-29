export class Conversation {
    input:any;
    context:any;

    constructor(_message, _context?) {
        this.input = {
            text: _message
        }
        this.context = _context
    }
}