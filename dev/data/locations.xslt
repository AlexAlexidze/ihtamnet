<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" version="1.0" exclude-result-prefixes="x">
	<xsl:output method="xml" indent="no" encoding="UTF-8"/>

	<xsl:template match="/">
		<locations>
			<xsl:apply-templates select="/x:Workbook/x:Worksheet/x:Table/x:Row[position()>1][x:Cell/x:Data]"/>
		</locations>
	</xsl:template>

	<xsl:template match="/x:Workbook/x:Worksheet/x:Table/x:Row[x:Cell/x:Data]">
		<location name="{x:Cell[1]/x:Data}" lat="{x:Cell[2]/x:Data}" lon="{x:Cell[3]/x:Data}"/>
	</xsl:template>
</xsl:stylesheet>