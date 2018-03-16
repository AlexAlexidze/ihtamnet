TARGET = data_RU.xml data_UA.xml loc_RU.xml loc_UA.xml

all: $(TARGET)

data_RU.xml: data_Ихтамнет.xml
	xsltproc data.xslt "$<" > "$@"

data_UA.xml: data_Ихтамнет_UA.xml
	xsltproc data.xslt "$<" > "$@"

loc_RU.xml: locations.xml
	xsltproc locations.xslt "$<" > "$@"

loc_UA.xml: locations_UA.xml
	xsltproc locations.xslt "$<" > "$@"

clean:
	-rm -f $(TARGET)

.PHONY: clean
