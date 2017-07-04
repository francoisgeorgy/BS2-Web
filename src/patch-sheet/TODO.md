Pass the sysex data in the querystring.

Example: patch-sheet.html?sysex=f00020290033000000000000000001004c00004804000200022010000730010043402000237f7f7f750000000d517c000820014420000000710247470000000000000e2000000c00002b0000202804081d1913680402011440202010080201004040100f7402010040364000000310000000000000000000000000000000000000000000000000000000000000000000000000000000000000f7

- If multiple 'sysex' params, print multiple sheets.
- If not 'sysex' param, print the init patch.

How to get the current bs2 object values?

Note: RFC 2616 (Hypertext Transfer Protocol — HTTP/1.1) states there is no limit to the length of a query string (section 3.2.1). 
RFC 3986 also states there is no limit, but indicates the hostname is limited to 255 characters because of DNS limitations (section 2.3.3).