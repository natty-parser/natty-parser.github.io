console.log("Starting...");
const properties=  [
	`user.timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`
]
console.log("Properties:", properties);
window.setup = async function setup() {
	if (window.nattyParser === undefined) {
		await cheerpjInit({
			enableDebug: false,
			version: 17,
			javaProperties: properties
		})

		const prefix = "/app/";
    const classpath = `${prefix}natty-1.1.1-SNAPSHOT.jar:${prefix}antlr-runtime-3.5.3.jar:${prefix}slf4j-api-2.0.17.jar:${prefix}slf4j-nop-2.0.17.jar`;
		console.log("Classpath:", classpath);
		const cj = await cheerpjRunLibrary(classpath);


		const Parser = await cj.org.natty.Parser;
		window.nattyParser = await new Parser();

		console.log("Parser loaded", window.nattyParser);
	}
	return window.nattyParser;
}
