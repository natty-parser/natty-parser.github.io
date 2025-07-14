
CLASSPATH:=$(shell find . -name "*.jar" | tr '\n' ':')
PARSE:=spring

run:
		npx serve


test:
		java -cp $(CLASSPATH) org.natty.Parser $(PARSE)
