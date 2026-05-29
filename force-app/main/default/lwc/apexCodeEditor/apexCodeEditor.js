import { LightningElement, track } from 'lwc';

export default class ApexCodeEditor extends LightningElement {

    @track code =
`public class AccountService {

    public static void processAccounts(List<Account> accounts) {

        for(Account acc : accounts) {

            if(acc.AnnualRevenue > 100000) {

                acc.Rating = 'Hot';
            }
        }
    }
}`;

    @track lineNumbers = [];

    apexKeywords = [
        'public',
        'private',
        'global',
        'class',
        'static',
        'void',
        'if',
        'else',
        'for',
        'while',
        'return',
        'new',
        'List',
        'Map',
        'Set',
        'String',
        'Integer',
        'Boolean',
        'Decimal',
        'Trigger'
    ];

    connectedCallback() {
        this.updateLineNumbers();
    }

    renderedCallback() {
        this.highlightSyntax();
    }

    handleInput(event) {
        this.code = event.target.value;

        this.updateLineNumbers();

        this.highlightSyntax();
    }

    updateLineNumbers() {

        const totalLines =
            this.code.split('\n').length;

        this.lineNumbers =
            Array.from(
                { length: totalLines },
                (_, i) => i + 1
            );
    }

    highlightSyntax() {

        let highlighted = this.escapeHtml(this.code);

        // keywords
        this.apexKeywords.forEach(keyword => {

            const regex =
                new RegExp(`\\b${keyword}\\b`, 'g');

            highlighted =
                highlighted.replace(
                    regex,
                    `<span class="keyword">${keyword}</span>`
                );
        });

        // strings
        highlighted =
            highlighted.replace(
                /'(.*?)'/g,
                `<span class="string">'$1'</span>`
            );

        // comments
        highlighted =
            highlighted.replace(
                /(\/\/.*)/g,
                `<span class="comment">$1</span>`
            );

        const codeBlock =
            this.template.querySelector('.highlight-code');

        if(codeBlock) {
            codeBlock.innerHTML = highlighted;
        }
    }

    escapeHtml(text) {

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    syncScroll(event) {

        const highlight =
            this.template.querySelector('.highlight-layer');

        highlight.scrollTop =
            event.target.scrollTop;

        highlight.scrollLeft =
            event.target.scrollLeft;
    }

    handleKeyDown(event) {

        const textarea = event.target;

        // TAB SUPPORT
        if(event.key === 'Tab') {

            event.preventDefault();

            const start =
                textarea.selectionStart;

            const end =
                textarea.selectionEnd;

            this.code =
                this.code.substring(0, start) +
                '    ' +
                this.code.substring(end);

            textarea.value = this.code;

            textarea.selectionStart =
                textarea.selectionEnd =
                start + 4;

            this.highlightSyntax();

            this.updateLineNumbers();
        }

        // AUTO INDENT
        if(event.key === 'Enter') {

            event.preventDefault();

            const start =
                textarea.selectionStart;

            const lines =
                this.code.substring(0, start).split('\n');

            const currentLine =
                lines[lines.length - 1];

            const indentMatch =
                currentLine.match(/^\s+/);

            const indent =
                indentMatch ? indentMatch[0] : '';

            this.code =
                this.code.substring(0, start) +
                '\n' +
                indent +
                this.code.substring(start);

            textarea.value = this.code;

            textarea.selectionStart =
                textarea.selectionEnd =
                start + indent.length + 1;

            this.highlightSyntax();

            this.updateLineNumbers();
        }
    }
}