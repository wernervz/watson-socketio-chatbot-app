export class Utterance {
    
    message:string;
    who:string;
    when:Date;
    tone:string;
    tone_score:number;
    type:string = 'text';
    choices:Array<any>;
    more:boolean = false;
    result_score:number = 0;
    spinner:boolean = false

    constructor(_message, _who, _type?:string) {
        this.message = _message;
        this.who = _who;
        this.when = new Date();
        if (_type) this.type = _type;
    }
}