console.log("Starting...");
const properties=  [
	`user.timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`
]
console.log("Properties:", properties);
let setupPromise = null;

window.setup = async function setup() {
	if (setupPromise === null) {
    setupPromise = (async () => {
	if (window.nattyParser === undefined) {
		function showPreloadProgress(preloadDone, preloadTotal) {
			const percentage = Math.round((preloadDone * 100) / preloadTotal);
			//console.log("Percentage loaded " + (preloadDone * 100) / preloadTotal);
			// Update all loading buttons
			console.log(percentage + "%");
		}
		await cheerpjInit({
			enableDebug: false,
			version: 17,
			javaProperties: properties,
			preloadResources: JSON.parse('{"/lt/17/lib/modules":[0,131072,1179648,2097152,2228224,3801088,3932160,4063232,4194304,4587520,4849664,5242880,5636096,5898240,6029312,6291456,6815744,7077888,7864320,7995392,9568256,9699328,9830400,10092544,37486592,37617664,38010880,38141952],"/lt/etc/users":[0,131072],"/lt/etc/localtime":[],"/lt/17/jre/lib/cheerpj-handlers.jar":[0,131072],"/lt/17/jre/lib/cheerpj-awt.jar":[0,131072],"/lt/17/jre/lib/cheerpj-jsobject.jar":[0,131072],"/lt/17/conf/security/java.security":[0,131072],"/lt/17/conf/logging.properties":[0,131072],"/lt/17/lib/tzdb.dat":[0,131072]}'),
			preloadProgress: showPreloadProgress
		})

		const prefix = "/app/";
    const classpath = `${prefix}natty-1.1.2-SNAPSHOT.jar:${prefix}antlr-runtime-3.5.3.jar`;
		console.log("Classpath:", classpath);
		const cj = await cheerpjRunLibrary(classpath);


		const Parser = await cj.org.natty.Parser;
		window.nattyParser = await new Parser();

		console.log("Parser loaded", window.nattyParser);
	}
	return window.nattyParser;
	 })();
  }
  return setupPromise;
}
window.setup();
