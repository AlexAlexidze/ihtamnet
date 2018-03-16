<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" version="1.0" exclude-result-prefixes="x ss">
	<xsl:output method="xml" indent="no" encoding="UTF-8"/>

	<xsl:template match="/">
		<garbage>
			<xsl:apply-templates select="/x:Workbook/x:Worksheet/x:Table/x:Row[position()>1][x:Cell[1]/x:Data]"/>
		</garbage>
	</xsl:template>

	<xsl:template match="/x:Workbook/x:Worksheet/x:Table/x:Row[x:Cell[1]/x:Data]">
		<offal
			id="{x:Cell[1]/x:Data}"
			rank="{normalize-space(x:Cell[2]/x:Data)}"
			func="{normalize-space(x:Cell[3]/x:Data)}"
			surname="{normalize-space(x:Cell[4]/x:Data)}"
			name="{normalize-space(x:Cell[5]/x:Data)}"
			unit="{normalize-space(x:Cell[6]/x:Data)}"
			date1="{x:Cell[7]/x:Data}"
			cdeath="{normalize-space(x:Cell[8]/x:Data)}"
			loc="{normalize-space(x:Cell[9]/x:Data)}"
			pub="{x:Cell[10]/x:Data}"
			date2="{x:Cell[11]/x:Data}"
			note1="{normalize-space(x:Cell[12]/@ss:HRef)}"
			note2="{normalize-space(x:Cell[13]/@ss:HRef)}"
			note3="{normalize-space(x:Cell[14]/x:Data)}"
		/>
	</xsl:template>
</xsl:stylesheet>