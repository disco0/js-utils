import { strictEqual, throws } from 'assert'
import { minifyCSS, Testable } from './minifyCSS.js'


/* === Acceptance === */
strictEqual(minifyCSS(`
:root {
  --foo: orange;
  
  --fooBar: red
}
.a { color: green; }
.b { color: var(--foo ); }
.c { color: var(--fooBar); }
.d { color: rgb(255, 255,  0); }
.e { color: #111; }
`),
	`.a{color:green}.b{color:orange}.c{color:red}.d{color:rgb(255,255,0)}.e{color:#111}`)


/* ==== Throws on Nested vars ==== */
throws(() => minifyCSS(`
:root {
  --a: 10px;
  --b: var(--a);
}
.nested {
  height: var(--b);
}
`))

/* ==== Throws on multi :root {} pseudo blocks ==== */
throws(() => minifyCSS(`
:root {
  --A: 11px;
}
:root {
  --B: 22px;
}
.multiRoot {
  height: var(--B);
}
`))



/* === Comments === */
testRegexMatchesGetDeleted(Testable.reBlockComments, `
/* Foo */
/* Multiline line 1 
Line 2 */
.a { color: red; } /* Bar */
/*/*/
`,
	`


.a { color: red; } 

`)


/* === Trimming === */
testRegexMatchesGetDeleted(Testable.reLeadingAndTrailingWhitespace, `
 .b .c {
	color: orange;
  width: 20px;
}
.d {
		height: 30px;
		}
`,
	`.b .c {
color: orange;
width: 20px;
}
.d {
height: 30px;
}`)


/* ==== Inner Prop Value space ==== */
testRegexMatchesGetDeleted(Testable.rePropValueWhitespaceSeparator, `
.e {
	color: #f00;
	height:   100px;
	width:	100px;
	content:  'a';
}
`,
	`
.e {
	color:#f00;
	height:100px;
	width:100px;
	content:'a';
}
`)


/* ==== Newlines ==== */
testRegexMatchesGetDeleted(Testable.reNewlines, `
.f {
	color: blue;
	height: 300px;
	width: 300px;
}
`,
	`.f {	color: blue;	height: 300px;	width: 300px;}`)


/* ==== White spaces before braces ==== */
testRegexMatchesGetDeleted(Testable.reWhitespaceBeforeBraces, `
.g { color: pink; width: 400px; } `,
	`
.g{ color: pink; width: 400px;} `)

/* ==== White spaces after braces ==== */
testRegexMatchesGetDeleted(Testable.reWhitespaceAfterBraces, `
.G { color: green; width: 410px; } `,
	`
.G {color: green; width: 410px; }`)

/* ==== Final semicolon ==== */
testRegexMatchesGetDeleted(Testable.reLastSemicolonInSet,
	'.h {color: cyan; width: 500px;}',
	'.h {color: cyan; width: 500px}'
)

/* ==== Comma + Space ==== */
testRegexMatchesGetDeleted(Testable.reSpacesAfterComma,
	'.H { color: rgb(255, 255, 0); }',
	'.H { color: rgb(255,255,0); }'
)

/* ==== Lines within :root ==== */
strictEqual(`
:root {
  --foo: 100px;
  --fooBar: 200px;
}
`.match(Testable.reRootPseudoClassBody)[1],
	`--foo: 100px;
  --fooBar: 200px;
`
)


/* ==== Inline Vars ==== */
const inCSS = `
:root {
  --foo: 100px;
  --fooBar: 200px;
}
.a {
  width: var(--foo);
  height: var(--fooBar);
  left: var( --fooBar  );
}
`;
const outCSS = `
:root {
  --foo: 100px;
  --fooBar: 200px;
}
.a {
  width: 100px;
  height: 200px;
  left: 200px;
}
`;
strictEqual(Testable.inlineVars(inCSS), outCSS)



function testRegexMatchesGetDeleted(regex, input, expected) {
	strictEqual(input.replace(regex, ''), expected)
}
