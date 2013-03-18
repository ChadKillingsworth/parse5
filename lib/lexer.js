var err = require('./err');

//Character const
var EOF = null,
    NULL = '\u0000',
    GRAVE_ACCENT = '\u0060',
    NULL_REPLACEMENT = '\ufffd';

//States
var DATA_STATE = 'DATA_STATE',
    CHARACTER_REFERENCE_IN_DATA_STATE = 'CHARACTER_REFERENCE_IN_DATA_STATE',
    RCDATA_STATE = 'RCDATA_STATE',
    CHARACTER_REFERENCE_IN_RCDATA_STATE = 'CHARACTER_REFERENCE_IN_RCDATA_STATE',
    RAWTEXT_STATE = 'RAWTEXT_STATE',
    SCRIPT_DATA_STATE = 'SCRIPT_DATA_STATE',
    PLAINTEXT_STATE = 'PLAINTEXT_STATE',
    TAG_OPEN_STATE = 'TAG_OPEN_STATE',
    END_TAG_OPEN_STATE = 'END_TAG_OPEN_STATE',
    TAG_NAME_STATE = 'TAG_NAME_STATE',
    RCDATA_LESS_THAN_SIGN_STATE = 'RCDATA_LESS_THAN_SIGN_STATE',
    RCDATA_END_TAG_OPEN_STATE = 'RCDATA_END_TAG_OPEN_STATE',
    RCDATA_END_TAG_NAME_STATE = 'RCDATA_END_TAG_NAME_STATE',
    RAWTEXT_LESS_THAN_SIGN_STATE = 'RAWTEXT_LESS_THAN_SIGN_STATE',
    RAWTEXT_END_TAG_OPEN_STATE = 'RAWTEXT_END_TAG_OPEN_STATE',
    RAWTEXT_END_TAG_NAME_STATE = 'RAWTEXT_END_TAG_NAME_STATE',
    SCRIPT_DATA_LESS_THAN_SIGN_STATE = 'SCRIPT_DATA_LESS_THAN_SIGN_STATE',
    SCRIPT_DATA_END_TAG_OPEN_STATE = 'SCRIPT_DATA_END_TAG_OPEN_STATE',
    SCRIPT_DATA_END_TAG_NAME_STATE = 'SCRIPT_DATA_END_TAG_NAME_STATE',
    SCRIPT_DATA_ESCAPE_START_STATE = 'SCRIPT_DATA_ESCAPE_START_STATE',
    SCRIPT_DATA_ESCAPE_START_DASH_STATE = 'SCRIPT_DATA_ESCAPE_START_DASH_STATE',
    SCRIPT_DATA_ESCAPED_STATE = 'SCRIPT_DATA_ESCAPED_STATE',
    SCRIPT_DATA_ESCAPED_DASH_STATE = 'SCRIPT_DATA_ESCAPED_DASH_STATE',
    SCRIPT_DATA_ESCAPED_DASH_DASH_STATE = 'SCRIPT_DATA_ESCAPED_DASH_DASH_STATE',
    SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE = 'SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE',
    SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE = 'SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE',
    SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE = 'SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPED_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPED_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE',
    SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE = 'SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE',
    BEFORE_ATTRIBUTE_NAME_STATE = 'BEFORE_ATTRIBUTE_NAME_STATE',
    ATTRIBUTE_NAME_STATE = 'ATTRIBUTE_NAME_STATE',
    AFTER_ATTRIBUTE_NAME_STATE = 'AFTER_ATTRIBUTE_NAME_STATE',
    BEFORE_ATTRIBUTE_VALUE_STATE = 'BEFORE_ATTRIBUTE_VALUE_STATE',
    ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE = 'ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE',
    ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE = 'ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE',
    ATTRIBUTE_VALUE_UNQUOTED_STATE = 'ATTRIBUTE_VALUE_UNQUOTED_STATE',
    CHARACTER_REFERENCE_IN_ATTRIBUTE_VALUES_STATE = 'CHARACTER_REFERENCE_IN_ATTRIBUTE_VALUES_STATE',
    AFTER_ATTRIBUTE_VALUE_QUOTED_STATE = 'AFTER_ATTRIBUTE_VALUE_QUOTED_STATE',
    SELF_CLOSING_START_TAG_STATE = 'SELF_CLOSING_START_TAG_STATE',
    BOGUS_COMMENT_STATE = 'BOGUS_COMMENT_STATE',
    MARKUP_DECLARATION_OPEN_STATE = 'MARKUP_DECLARATION_OPEN_STATE',
    COMMENT_START_STATE = 'COMMENT_START_STATE',
    COMMENT_START_DASH_STATE = 'COMMENT_START_DASH_STATE',
    COMMENT_STATE = 'COMMENT_STATE',
    COMMENT_END_DASH_STATE = 'COMMENT_END_DASH_STATE',
    COMMENT_END_STATE = 'COMMENT_END_STATE',
    COMMENT_END_BANG_STATE = 'COMMENT_END_BANG_STATE',
    DOCTYPE_STATE = 'DOCTYPE_STATE',
    BEFORE_DOCTYPE_NAME_STATE = 'BEFORE_DOCTYPE_NAME_STATE',
    DOCTYPE_NAME_STATE = 'DOCTYPE_NAME_STATE',
    AFTER_DOCTYPE_NAME_STATE = 'AFTER_DOCTYPE_NAME_STATE',
    AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE = 'AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE',
    BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE = 'BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE',
    DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE = 'DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE',
    DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE = 'DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE',
    AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE = 'AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE',
    BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE = 'BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE',
    AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE = 'AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE',
    BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE = 'BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE',
    DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE = 'DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE',
    DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE = 'DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE',
    AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE = 'AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE',
    BOGUS_DOCTYPE_STATE = 'BOGUS_DOCTYPE_STATE',
    CDATA_SECTION_STATE = 'CDATA_SECTION_STATE';

//Utils
function asciiToLower(ch) {
    //NOTE: it's pretty fast, faster than String.toLowerCase
    return String.fromCharCode(ch.charCodeAt(0) + 0x0020);
}

var Lexer = exports.Lexer = function (html) {
    //Input data
    this.html = html;

    //Positioning
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.lineLengths = [];

    //Tokenization
    this.state = DATA_STATE;
    this.tempBuff = '';
    this.lastStartTagName = null;
    this.currentTagToken = null;
    this.currentCommentToken = null;
    this.currentAttr = {};
    this.tokenQueue = [];
    this.errs = [];
};

//Token types
Lexer.CHARACTER_TOKEN = 'CHARACTER_TOKEN';
Lexer.START_TAG_TOKEN = 'START_TAG_TOKEN';
Lexer.END_TAG_TOKEN = 'END_TAG_TOKEN';
Lexer.COMMENT_TOKEN = 'COMMENT_TOKEN';
Lexer.EOF_TOKEN = 'EOF_TOKEN';

//Proto
Lexer.prototype.getToken = function () {
    var ch = EOF,
        prevCh = this.html[this.pos - 1];

    //NOTE: iterate through states until we don't get at least one token in the queue
    while (!this.tokenQueue.length) {
        if (this.pos < this.html.length)
            ch = this.html[this.pos];

        //NOTE: treat CR+LF as single line break
        if ((ch === '\n' && prevCh !== '\r') || ch === '\r' || ch === '\f') {
            this.lineLengths.push(this.col);
            this.line++;
            this.col = 1;
        }
        else if (!(ch === '\n' && prevCh === '\r'))
            this.col++;

        this[this.state](ch);

        prevCh = ch;
        this.pos++;
    }

    return this.tokenQueue.shift();
};

Lexer.prototype._reconsume = function (inState) {
    this.state = inState;

    this.pos--;
    this.col--;

    if (!this.col) {
        this.line--;
        this.col = this.lineLengths[this.line];
    }
};

//Utils
Lexer.prototype._err = function (code) {
    this.errs.push({
        code: code,
        line: this.line,
        col: this.col
    });
};

Lexer.prototype._unexpectedEOF = function () {
    this._err(err.UNEXPECTED_END_OF_FILE);
    this._reconsume(DATA_STATE);
};

Lexer.prototype._emitCharacterToken = function (ch) {
    this.tokenQueue.push({
        type: Lexer.CHARACTER_TOKEN,
        ch: ch
    });
};

Lexer.prototype._emitEOFToken = function () {
    this.tokenQueue.push({type: Lexer.EOF_TOKEN});
};

Lexer.prototype._emitCurrentCommentToken = function () {
    this.tokenQueue.push(this.currentCommentToken);
    this.currentCommentToken = null;
};

Lexer.prototype._emitCurrentTagToken = function () {
    if (this.currentTagToken.type === Lexer.START_TAG_TOKEN)
        this.lastStartTagName = this.currentTagToken.tagName;

    this.tokenQueue.push(this.currentTagToken);
    this.currentTagToken = null;
};

Lexer.prototype._createStartTagToken = function (tagNameFirstCh) {
    this.currentTagToken = {
        type: Lexer.START_TAG_TOKEN,
        tagName: tagNameFirstCh,
        selfClosing: false,
        attrs: []
    };
};

Lexer.prototype._createEndTagToken = function (tagNameFirstCh) {
    this.currentTagToken = {
        type: Lexer.END_TAG_TOKEN,
        tagName: tagNameFirstCh
    };
};

Lexer.prototype._createCommentToken = function () {
    this.currentCommentToken = {
        type: Lexer.COMMENT_TOKEN,
        data: ''
    };
};

Lexer.prototype._createAttr = function (attrNameFirstCh) {
    this.currentAttr = {
        name: attrNameFirstCh,
        value: ''
    };
};

Lexer.prototype._isDuplicateAttr = function () {
    var attrs = this.currentTagToken.attrs;

    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name === this.currentAttr.name)
            return true;
    }

    return false;
};

Lexer.prototype._leaveAttrName = function (toState) {
    this.state = toState;

    //TODO lookup for end tag
    if (this._isDuplicateAttr())
        this._err(err.DUPLICATE_ATTRIBUTE);
    else
        this.currentTagToken.attrs.push(this.currentAttr);
};

Lexer.prototype._isAppropriateEndTagToken = function () {
    return this.lastStartTagName === this.currentTagToken.tagName;
};

//State processors
var _ = Lexer.prototype;

//12.2.4.1 Data state
_[DATA_STATE] = function (ch) {
    if (ch === '&')
        this.state = CHARACTER_REFERENCE_IN_DATA_STATE;

    else if (ch === '<')
        this.state = TAG_OPEN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(ch);
    }

    else if (ch === EOF)
        this._emitEOFToken();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.2 Character reference in data state
_[CHARACTER_REFERENCE_IN_DATA_STATE] = function (ch) {
    //TODO
};

//12.2.4.3 RCDATA state
_[RCDATA_STATE] = function (ch) {
    if (ch === '&')
        this.state = CHARACTER_REFERENCE_IN_RCDATA_STATE;

    else if (ch === '<')
        this.state = RCDATA_LESS_THAN_SIGN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._emitEOFToken();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.4 Character reference in RCDATA state
_[CHARACTER_REFERENCE_IN_RCDATA_STATE] = function (ch) {
    //TODO
};

//12.2.4.5 RAWTEXT state
_[RAWTEXT_STATE] = function (ch) {
    if (ch === '<')
        this.state = RAWTEXT_LESS_THAN_SIGN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._emitEOFToken();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.6 Script data state
_[SCRIPT_DATA_STATE] = function (ch) {
    if (ch === '<')
        this.state = SCRIPT_DATA_LESS_THAN_SIGN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._emitEOFToken();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.7 PLAINTEXT state
_[PLAINTEXT_STATE] = function (ch) {
    if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._emitEOFToken();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.8 Tag open state
_[TAG_OPEN_STATE] = function (ch) {
    if (ch === '!')
        this.state = MARKUP_DECLARATION_OPEN_STATE;

    else if (ch === '/')
        this.state = END_TAG_OPEN_STATE;

    else if (ch >= 'A' && ch <= 'Z') {
        this._createStartTagToken(asciiToLower(ch));
        this.state = TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createStartTagToken(ch);
        this.state = TAG_NAME_STATE;
    }

    else if (ch === '?') {
        this._err(err.BOGUS_COMMENT);
        this.state = BOGUS_COMMENT_STATE;
    }

    else {
        this._err(err.UNEXPECTED_CHARACTER_IN_TAG_NAME);
        this._emitCharacterToken('<');
        this._reconsume(DATA_STATE);
    }
};

//12.2.4.9 End tag open state
_[END_TAG_OPEN_STATE] = function (ch) {
    if (ch >= 'A' && ch <= 'Z') {
        this._createEndTagToken(asciiToLower(ch));
        this.state = TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createEndTagToken(ch);
        this.state = TAG_NAME_STATE;
    }

    else if (ch === '>') {
        this._err(err.MISSING_END_TAG_NAME);
        this.state = DATA_STATE;
    }

    else if (ch === EOF) {
        this._unexpectedEOF();
        this._emitCharacterToken('<');
        this._emitCharacterToken('/');
    }

    else {
        this._err(err.BOGUS_COMMENT);
        this.state = BOGUS_COMMENT_STATE;
    }
};

//12.2.4.10 Tag name state
_[TAG_NAME_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        this.state = BEFORE_ATTRIBUTE_NAME_STATE;

    else if (ch === '/')
        this.state = SELF_CLOSING_START_TAG_STATE;

    else if (ch === '>') {
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch >= 'A' && ch <= 'Z')
        this.currentTagToken.tagName += asciiToLower(ch);

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentTagToken.tagName += NULL_REPLACEMENT;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this.currentTagToken.tagName += ch;
};

//12.2.4.11 RCDATA less-than sign state
_[RCDATA_LESS_THAN_SIGN_STATE] = function (ch) {
    if (ch === '/') {
        this.tempBuff = '';
        this.state = RCDATA_END_TAG_OPEN_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._reconsume(RCDATA_STATE);
    }
};

//12.2.4.12 RCDATA end tag open state
_[RCDATA_END_TAG_OPEN_STATE] = function (ch) {
    if (ch >= 'A' && ch <= 'Z') {
        this._createStartTagToken(asciiToLower(ch));
        this.tempBuff += ch;
        this.state = RCDATA_END_TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createStartTagToken(ch);
        this.tempBuff += ch;
        this.state = RCDATA_END_TAG_NAME_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._emitCharacterToken('/');
        this._reconsume(RCDATA_STATE);
    }
};

//12.2.4.13 RCDATA end tag name state
_[RCDATA_END_TAG_NAME_STATE] = function (ch) {
    var lexer = this,
        defaultEntry = function () {
            lexer._emitCharacterToken('<');
            lexer._emitCharacterToken('/');

            for (var i = 0; i < lexer.tempBuff.length; i++)
                lexer._emitCharacterToken(lexer.tempBuff[i]);

            lexer._reconsume(RCDATA_STATE);
        };

    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ') {
        if (this._isAppropriateEndTagToken())
            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
        else
            defaultEntry();
    }

    else if (ch === '/') {
        if (this._isAppropriateEndTagToken())
            this.state = SELF_CLOSING_START_TAG_STATE;
        else
            defaultEntry();
    }

    else if (ch === '>') {
        if (this._isAppropriateEndTagToken()) {
            this.state = DATA_STATE;
            this._emitCurrentTagToken();
        } else
            defaultEntry();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.currentTagToken.tagName += asciiToLower(ch);
        this.tempBuff += ch;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.currentTagToken.tagName += ch;
        this.tempBuff += ch;
    }

    else
        defaultEntry();
};

//12.2.4.14 RAWTEXT less-than sign state
_[RAWTEXT_LESS_THAN_SIGN_STATE] = function (ch) {
    if (ch === '/') {
        this.tempBuff = '';
        this.state = RAWTEXT_END_TAG_OPEN_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._reconsume(RAWTEXT_STATE);
    }
};

//12.2.4.15 RAWTEXT end tag open state
_[RAWTEXT_END_TAG_OPEN_STATE] = function (ch) {
    if (ch >= 'A' && ch <= 'Z') {
        this._createEndTagToken(asciiToLower(ch));
        this.tempBuff += ch;
        this.state = RAWTEXT_END_TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createEndTagToken(ch);
        this.tempBuff += ch;
        this.state = RAWTEXT_END_TAG_NAME_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._emitCharacterToken('/');
        this._reconsume(RAWTEXT_STATE);
    }
};

//12.2.4.16 RAWTEXT end tag name state
_[RAWTEXT_END_TAG_NAME_STATE] = function (ch) {
    var lexer = this,
        defaultEntry = function () {
            lexer._emitCharacterToken('<');
            lexer._emitCharacterToken('/');

            for (var i = 0; i < lexer.tempBuff.length; i++)
                lexer._emitCharacterToken(lexer.tempBuff[i]);

            lexer._reconsume(RAWTEXT_STATE);
        };

    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ') {
        if (this._isAppropriateEndTagToken())
            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
        else
            defaultEntry();
    }

    else if (ch === '/') {
        if (this._isAppropriateEndTagToken())
            this.state = SELF_CLOSING_START_TAG_STATE;
        else
            defaultEntry();
    }

    else if (ch === '>') {
        if (this._isAppropriateEndTagToken()) {
            this._emitCurrentTagToken();
            this.state = DATA_STATE;
        } else
            defaultEntry();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.currentTagToken.tagName += asciiToLower(ch);
        this.tempBuff += ch;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.currentTagToken.tagName += ch;
        this.tempBuff += ch;
    }

    else
        defaultEntry();
};

//12.2.4.17 Script data less-than sign state
_[SCRIPT_DATA_LESS_THAN_SIGN_STATE] = function (ch) {
    if (ch === '/') {
        this.tempBuff = '';
        this.state = SCRIPT_DATA_END_TAG_OPEN_STATE;
    }

    else if (ch === '!') {
        this.state = SCRIPT_DATA_ESCAPE_START_STATE;
        this._emitCharacterToken('<');
        this._emitCharacterToken('!');
    }

    else {
        this._emitCharacterToken('<');
        this._reconsume(SCRIPT_DATA_STATE);
    }
};

//12.2.4.18 Script data end tag open state
_[SCRIPT_DATA_END_TAG_OPEN_STATE] = function (ch) {
    if (ch >= 'A' && ch <= 'Z') {
        this._createEndTagToken(asciiToLower(ch));
        this.tempBuff += ch;
        this.state = SCRIPT_DATA_END_TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createEndTagToken(ch);
        this.tempBuff += ch;
        this.state = SCRIPT_DATA_END_TAG_NAME_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._emitCharacterToken('/');
        this._reconsume(SCRIPT_DATA_STATE);
    }
};

//12.2.4.19 Script data end tag name state
_[SCRIPT_DATA_END_TAG_NAME_STATE] = function (ch) {
    var lexer = this,
        defaultEntry = function () {
            lexer._emitCharacterToken('<');
            lexer._emitCharacterToken('/');

            for (var i = 0; i < lexer.tempBuff.length; i++)
                lexer._emitCharacterToken(lexer.tempBuff[i]);

            lexer._reconsume(SCRIPT_DATA_STATE);
        };

    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ') {
        if (this._isAppropriateEndTagToken())
            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
        else
            defaultEntry();
    }

    else if (ch === '/') {
        if (this._isAppropriateEndTagToken())
            this.state = SELF_CLOSING_START_TAG_STATE;
        else
            defaultEntry();
    }

    else if (ch === '>') {
        if (this._isAppropriateEndTagToken()) {
            this._emitCurrentTagToken();
            this.state = DATA_STATE;
        } else
            defaultEntry();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.currentTagToken.tagName += asciiToLower(ch);
        this.tempBuff += ch;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.currentTagToken.tagName += ch;
        this.tempBuff += ch;
    }

    else
        defaultEntry();
};

//12.2.4.20 Script data escape start state
_[SCRIPT_DATA_ESCAPE_START_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_ESCAPE_START_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else
        this._reconsume(SCRIPT_DATA_STATE);
};

//12.2.4.21 Script data escape start dash state
_[SCRIPT_DATA_ESCAPE_START_DASH_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_ESCAPED_DASH_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else
        this._reconsume(SCRIPT_DATA_STATE);
};

//12.2.4.22 Script data escaped state
_[SCRIPT_DATA_ESCAPED_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_ESCAPED_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else if (ch === '<')
        this.state = SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.23 Script data escaped dash state
_[SCRIPT_DATA_ESCAPED_DASH_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_ESCAPED_DASH_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else if (ch === '<')
        this.state = SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.state = SCRIPT_DATA_ESCAPED_STATE;
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this.state = SCRIPT_DATA_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }
};

//12.2.4.24 Script data escaped dash dash state
_[SCRIPT_DATA_ESCAPED_DASH_DASH_STATE] = function (ch) {
    if (ch === '-')
        this._emitCharacterToken('-');

    else if (ch === '<')
        this.state = SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE;

    else if (ch === '>') {
        this.state = SCRIPT_DATA_STATE;
        this._emitCharacterToken('>');
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.state = SCRIPT_DATA_ESCAPED_STATE;
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this.state = SCRIPT_DATA_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }
};

//12.2.4.25 Script data escaped less-than sign state
_[SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE] = function (ch) {
    if (ch === '/') {
        this.tempBuff = '';
        this.state = SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE;
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.tempBuff = asciiToLower(ch);
        this.state = SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE;
        this._emitCharacterToken('<');
        this._emitCharacterToken(ch);
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.tempBuff = ch;
        this.state = SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE;
        this._emitCharacterToken('<');
        this._emitCharacterToken(ch);
    }

    else {
        this._emitCharacterToken('<');
        this._reconsume(SCRIPT_DATA_ESCAPED_STATE);
    }
};

//12.2.4.26 Script data escaped end tag open state
_[SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE] = function (ch) {
    if (ch >= 'A' && ch <= 'Z') {
        this._createEndTagToken(asciiToLower(ch));
        this.tempBuff += ch;
        this.state = SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this._createEndTagToken(ch);
        this.tempBuff += ch;
        this.state = SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE;
    }

    else {
        this._emitCharacterToken('<');
        this._emitCharacterToken('/');
        this._reconsume(SCRIPT_DATA_ESCAPED_STATE);
    }
};

//12.2.4.27 Script data escaped end tag name state
_[SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE] = function (ch) {
    var lexer = this,
        defaultEntry = function () {
            lexer._emitCharacterToken('<');
            lexer._emitCharacterToken('/');

            for (var i = 0; i < lexer.tempBuff.length; i++)
                lexer._emitCharacterToken(lexer.tempBuff[i]);

            lexer._reconsume(SCRIPT_DATA_ESCAPED_STATE);
        };

    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ') {
        if (this._isAppropriateEndTagToken())
            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
        else
            defaultEntry();
    }

    else if (ch === '/') {
        if (this._isAppropriateEndTagToken())
            this.state = SELF_CLOSING_START_TAG_STATE;
        else
            defaultEntry();
    }

    else if (ch === '>') {
        if (this._isAppropriateEndTagToken()) {
            this._emitCurrentTagToken();
            this.state = DATA_STATE;
        } else
            defaultEntry();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.currentTagToken.tagName += asciiToLower(ch);
        this.tempBuff += ch;
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.currentTagToken.tagName += ch;
        this.tempBuff += ch;
    }

    else
        defaultEntry();
};

//12.2.4.28 Script data double escape start state
_[SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ' || ch === '/' || ch === '>') {
        this.state = this.tempBuff === 'script' ? SCRIPT_DATA_DOUBLE_ESCAPED_STATE : SCRIPT_DATA_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.tempBuff += asciiToLower(ch);
        this._emitCharacterToken(ch);
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.tempBuff += ch;
        this._emitCharacterToken(ch);
    }

    else
        this._reconsume(SCRIPT_DATA_ESCAPED_STATE);
};

//12.2.4.29 Script data double escaped state
_[SCRIPT_DATA_DOUBLE_ESCAPED_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else if (ch === '<') {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE;
        this._emitCharacterToken('<');
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this._emitCharacterToken(ch);
};

//12.2.4.30 Script data double escaped dash state
_[SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE] = function (ch) {
    if (ch === '-') {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE;
        this._emitCharacterToken('-');
    }

    else if (ch === '<') {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE;
        this._emitCharacterToken('<');
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_STATE;
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }
};

//12.2.4.31 Script data double escaped dash dash state
_[SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE] = function (ch) {
    if (ch === '-')
        this._emitCharacterToken('-');

    else if (ch === '<') {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE;
        this._emitCharacterToken('<');
    }

    else if (ch === '>') {
        this.state = SCRIPT_DATA_STATE;
        this._emitCharacterToken('>');
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_STATE;
        this._emitCharacterToken(NULL_REPLACEMENT);
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this.state = SCRIPT_DATA_DOUBLE_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }
};

//12.2.4.32 Script data double escaped less-than sign state
_[SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE] = function (ch) {
    if (ch === '/') {
        this.tempBuff = '';
        this.state = SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE;
        this._emitCharacterToken('/');
    }

    else
        this._reconsume(SCRIPT_DATA_DOUBLE_ESCAPED_STATE);
};

//12.2.4.33 Script data double escape end state
_[SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ' || ch === '/' || ch === '>') {
        this.state = this.tempBuff === 'script' ? SCRIPT_DATA_ESCAPED_STATE : SCRIPT_DATA_DOUBLE_ESCAPED_STATE;
        this._emitCharacterToken(ch);
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this.tempBuff += asciiToLower(ch);
        this._emitCharacterToken(ch);
    }

    else if (ch >= 'a' && ch <= 'z') {
        this.tempBuff += ch;
        this._emitCharacterToken(ch);
    }

    else
        this._reconsume(SCRIPT_DATA_DOUBLE_ESCAPED_STATE);
};

//12.2.4.34 Before attribute name state
_[BEFORE_ATTRIBUTE_NAME_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        return;

    if (ch === '/')
        this.state = SELF_CLOSING_START_TAG_STATE;

    else if (ch === '>') {
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this._createAttr(asciiToLower(ch));
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._createAttr(NULL_REPLACEMENT);
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === '\'' || ch === '"' || ch === '<' || ch === '=') {
        this._err(err.MAILFORMED_ATTRIBUTE_NAME);
        this._createAttr(ch);
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this._createAttr(ch);
        this.state = ATTRIBUTE_NAME_STATE;
    }
};

//12.2.4.35 Attribute name state
_[AFTER_ATTRIBUTE_NAME_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        this._leaveAttrName(AFTER_ATTRIBUTE_NAME_STATE);

    else if (ch === '/')
        this._leaveAttrName(SELF_CLOSING_START_TAG_STATE);

    else if (ch === '=')
        this._leaveAttrName(BEFORE_ATTRIBUTE_VALUE_STATE);

    else if (ch === '>') {
        this._leaveAttrName(DATA_STATE);
        this._emitCurrentTagToken();
    }

    else if (ch >= 'A' && ch <= 'Z')
        this.currentAttr.name += asciiToLower(ch);

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentAttr.name += NULL_REPLACEMENT;
    }

    else if (ch === '\'' || ch === '"' || ch === '<') {
        this.err(err.MAILFORMED_ATTRIBUTE_NAME);
        this.currentAttr.name += ch;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this.currentAttr.name += ch;
};

//12.2.4.36 After attribute name state
_[AFTER_ATTRIBUTE_NAME_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        return;

    if (ch === '/')
        this.state = SELF_CLOSING_START_TAG_STATE;

    else if (ch === '=')
        this.state = BEFORE_ATTRIBUTE_VALUE_STATE;

    else if (ch === '>') {
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch >= 'A' && ch <= 'Z') {
        this._createAttr(asciiToLower(ch));
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this._createAttr(NULL_REPLACEMENT);
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === '\'' || ch === '"' || ch === '<') {
        this._err(err.MAILFORMED_ATTRIBUTE_NAME);
        this._createAttr(ch);
        this.state = ATTRIBUTE_NAME_STATE;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this._createAttr(ch);
        this.state = ATTRIBUTE_NAME_STATE;
    }
};

//12.2.4.37 Before attribute value state
_[BEFORE_ATTRIBUTE_VALUE_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        return;

    if (ch === '"')
        this.state = ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE;

    else if (ch === '&')
        this._reconsume(ATTRIBUTE_VALUE_UNQUOTED_STATE);

    else if (ch === '\'')
        this.state = ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentAttr.value += NULL_REPLACEMENT;
        this.state = ATTRIBUTE_VALUE_UNQUOTED_STATE;
    }

    else if (ch === '>') {
        this._err(err.INVALID_ATTRIBUTE_DEFINITION);
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch === '<' || ch === '=' || ch === GRAVE_ACCENT) {
        this._err(err.MAILFORMED_ATTRIBUTE_VALUE);
        this.currentAttr.value += ch;
        this.state = ATTRIBUTE_VALUE_UNQUOTED_STATE;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this.currentAttr.value += ch;
        this.state = ATTRIBUTE_VALUE_UNQUOTED_STATE;
    }
};

//12.2.4.38 Attribute value (double-quoted) state
_[ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE] = function (ch) {
    if (ch === '"')
        this.state = AFTER_ATTRIBUTE_VALUE_QUOTED_STATE;

    else if (ch === '&') {
        //TODO Switch to the character reference in attribute value state, with the additional allowed character being U+0022 QUOTATION MARK (").
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentAttr.value += NULL_REPLACEMENT
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this.currentAttr.value += ch;
};

//12.2.4.39 Attribute value (single-quoted) state
_[ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE] = function (ch) {
    if (ch === '\'')
        this.state = AFTER_ATTRIBUTE_VALUE_QUOTED_STATE;

    else if (ch === '&') {
        //TODO Switch to the character reference in attribute value state, with the additional allowed character being U+0027 APOSTROPHE (').
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentAttr.value += NULL_REPLACEMENT;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this.currentAttr.value += ch;
};

//12.2.4.40 Attribute value (unquoted) state
_[ATTRIBUTE_VALUE_UNQUOTED_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        this.state = BEFORE_ATTRIBUTE_NAME_STATE;

    else if (ch === '&') {
        //TODO Switch to the character reference in attribute value state, with the additional allowed character being U+003E GREATER-THAN SIGN (>).
    }

    else if (ch === '>') {
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentAttr.value += NULL_REPLACEMENT;
    }

    else if (ch === '\'' || ch === '"' || ch === '<' || ch === '=' || ch === GRAVE_ACCENT) {
        this._err(err.MAILFORMED_ATTRIBUTE_VALUE);
        this.currentAttr.value += ch;
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else
        this.currentAttr.value += ch;
};

//12.2.4.41 Character reference in attribute value state
_[CHARACTER_REFERENCE_IN_ATTRIBUTE_VALUES_STATE] = function (ch) {
    //TODO
};

//12.2.4.42 After attribute value (quoted) state
_[AFTER_ATTRIBUTE_VALUE_QUOTED_STATE] = function (ch) {
    if (ch === '\n' || ch === '\r' || ch === '\f' || ch === '\t' || ch === ' ')
        this.state = BEFORE_ATTRIBUTE_NAME_STATE;

    else if (ch === '/')
        this.state = SELF_CLOSING_START_TAG_STATE;

    else if (ch === '>') {
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this._err(err.UNEXPECTED_CHARACTER_IN_TAG_DEFINITION);
        this._reconsume(BEFORE_ATTRIBUTE_NAME_STATE);
    }
};

//12.2.4.43 Self-closing start tag state
_[SELF_CLOSING_START_TAG_STATE] = function (ch) {
    if (ch === '>') {
        this.currentTagToken.selfClosing = true;
        this.state = DATA_STATE;
        this._emitCurrentTagToken();
    }

    else if (ch === EOF)
        this._unexpectedEOF();

    else {
        this._err(err.UNEXPECTED_CHARACTER_IN_TAG_DEFINITION);
        this._reconsume(BEFORE_ATTRIBUTE_NAME_STATE);
    }
};

//12.2.4.44 Bogus comment state
_[BOGUS_COMMENT_STATE] = function (ch) {
    //TODO
};

//12.2.4.45 Markup declaration open state
_[MARKUP_DECLARATION_OPEN_STATE] = function (ch) {
    //TODO
};

//12.2.4.46 Comment start state
_[COMMENT_START_STATE] = function (ch) {
    if (ch === '-')
        this.state = COMMENT_START_DASH_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentCommentToken.data += NULL_REPLACEMENT;
        this.state = COMMENT_STATE;
    }

    else if (ch === '>') {
        this._err(err.MAILFORMED_COMMENT);
        this.state = DATA_STATE;
        this._emitCurrentCommentToken();
    }

    else if (ch === EOF) {
        this._emitCurrentCommentToken();
        this._unexpectedEOF();
    }

    else {
        this.currentCommentToken.data += ch;
        this.state = COMMENT_STATE;
    }
};

//12.2.4.47 Comment start dash state
_[COMMENT_START_DASH_STATE] = function (ch) {
    if (ch === '-')
        this.state = COMMENT_END_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentCommentToken.data += '-';
        this.currentCommentToken.data += NULL_REPLACEMENT;
        this.state = COMMENT_STATE;
    }

    else if (ch === '>') {
        this._err(err.MAILFORMED_COMMENT);
        this.state = DATA_STATE;
        this._emitCurrentCommentToken();
    }

    else if (ch === EOF) {
        this._emitCurrentCommentToken();
        this._unexpectedEOF();
    }

    else {
        this.currentCommentToken.data += '-';
        this.currentCommentToken.data += ch;
        this.state = COMMENT_STATE;
    }
};

//12.2.4.48 Comment state
_[COMMENT_STATE] = function (ch) {
    if (ch === '-')
        this.state = COMMENT_END_DASH_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentCommentToken.data += NULL_REPLACEMENT;
    }

    else if (ch === EOF) {
        this._emitCurrentCommentToken();
        this._unexpectedEOF();
    }

    else
        this.currentCommentToken.data += ch;
};

//12.2.4.49 Comment end dash state
_[COMMENT_END_DASH_STATE] = function (ch) {
    if (ch === '-')
        this.state = COMMENT_END_STATE;

    else if (ch === NULL) {
        this._err(err.UNEXPECTED_NULL_CHARACTER);
        this.currentCommentToken.data += '-';
        this.currentCommentToken.data += NULL_REPLACEMENT;
        this.state = COMMENT_STATE;
    }

    else if (ch === EOF) {
        this._emitCurrentCommentToken();
        this._unexpectedEOF();
    }

    else {
        this.currentCommentToken.data += '-';
        this.currentCommentToken.data += ch;
        this.state = COMMENT_STATE;
    }
};

//12.2.4.50 Comment end state