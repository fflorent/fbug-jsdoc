JSDOC.PluginManager.registerPlugin(
  "JSDOC.customWiki", {

    onDocCommentTags: function(comment) {
      for (var i=0, tag; tag=comment.tags[i]; i++) {
        if (tag.desc && ' desc param return class namespace dialog domplate module panel service '.indexOf(' '+tag.title+' ') != -1) {
          tag.desc = tag.desc.replace(/\r/g, '\n');
          tag.desc = customWiki.parse(tag.desc);
        }
      }
    }
  }
);
/**/

(function() {
/**
 * The customWiki is a small library to generate HTML code from a raw text
 * formatted with wiki-like syntax. This library was inspired in Darren 
 * Turland's microWiki plugin for JsDoc Toolkit. 
 * 
 * The customWiki can be used as a JsDocToolkit plugin, to automatically format 
 * the documentation of source codes, but it can also be used as an independent 
 * library, to provide wiki-format other applications like blogs or forums.
 * 
 * The customWiki default syntax is a mix of wikipedia and wikidot syntaxes, 
 * with small modifications to make the raw code more readable as possible. 
 * This is designed specially to allow the use of wiki syntax inside 
 * programming code comments, without creating lots of markup visual 
 * pollution that makes the source code difficult to read.
 * 
 * And as the name suggests, the customWiki is fully customizable. You can 
 * easily modify any aspect of the syntax, by altering the options in
 * "customWiki.options" and the rules in "customWiki.rules". You can also 
 * create new rules to add extra funcionalities in the syntax, or remove 
 * the rules you want to ignore.
 * 
 * ==customWiki Syntax==
 * 
 * ===1. Basic Formatting===
 *   -- blank lines    -> Blank lines will be treated as new paragraphes.
 * 
 * ===2. Text Formatting===
 *   --  *text*        -> bold text
 *   -- __text__       -> italic text
 *   --  ^text^        -> superscript text
 *   --  `text`        -> subscript text
 * 
 * ===3. Header Formatting===
 *   -- ==text==       -> 2nd level header
 *   -- ===text===     -> 3rd level header
 *   -- ====text====   -> 4th level header
 *   -- and so on..    -> and so on...
 * 
 * ===4. Code Formatting===
 *   -- ~text~         -> inline code. Will be wrapped with "<code>"
 *   -- ~~text~~       -> code block. Will be wrapped with "<pre>" with styling 
 *                        options defined in "customWiki.options.codeBlock".
 *   -- ~~:lang text~~ -> code block with a custom language (detault is "js").
 *   
 *   The code inside code blocks will be displayed with syntax highlight. Also,
 *   all wiki syntax by default will be ignored inside code blocks, to avoid
 *   the code being formatted wrongly as in the following cases:
 *   
 *   *Code Example1:*
 * [-------------------------------------------------------------------]
 *   ~~
 *   var __notItalic__ = '';        // __notItalic__ is not a italic
 *   var notBold = 24 * 60 * 60;    // * 60 * is not a bold
 *   if (test1 == test2 == test3) { // == test2 == is not a header
 *     return;
 *   }
 *   ~~
 * [-------------------------------------------------------------------]
 *   
 *   The customWiki default settings presumes you are using the "Google Code
 *   Prettity", a very popular syntax highlight tool:
 *   ([[http://code.google.com/p/google-code-prettify/]]).
 *   
 *   ~~
 *   var __notItalic__ = '';        // __notItalic__ is not a italic
 *   var notBold = 24 * 60 * 60;    // * 60 * is not a bold
 *   if (test1 == test2 == test3) { // == test2 == is not a header
 *     return;
 *   }
 *   ~~
 *   
 *   By default, the controls and the gutter are hided and the language used 
 *   to highlight is JavaScript. You can change all this options in 
 *   customWiki.options, but for the language type, you have also a shortcut,
 *   using ":lang" right after the first "~~", like the following code:
 *   
 *   *Code Example2:*
 * [-------------------------------------------------------------------]
 *   ~~:html
 *   <div></div>
 *   ~~
 * [-------------------------------------------------------------------]
 *   
 * ===5. Link Formatting===
 *   -- [[ url ]]         -> link to a url, with the url itself as the title.
 *   -- [[ url | Title ]] -> link to a url, with a custom title.
 *
 * ===6. List Formatting===
 *   -- - -> 2 spaces or more followed by "-" will create an unordered list item.
 *   -- # -> 2 spaces or more followed by "#" will create an ordered list item.
 * 
 * ===7. Table Formatting===
 * 
 * Tables syntax is a little bit more complex. The basic syntax is:
 * 
 * [-------------------------------------------------------------------]
 *   {tableBegin} {tableContent} {tableEnd}
 * [-------------------------------------------------------------------]
 * 
 * Where the pattern of "tableBegin" and "tableEnd" is:
 * 
 *   -- "+" ("+" OR "=")+ -> This is the "tableBegin" and "tableEnd" pattern.
 *                           It can include two symbols: a column definition
 *                           symbol "+", and an aptional fill symbol "=". It
 *                           must start with a "+" followed by any sequence
 *                           of "+"'s and "="'s. The "tableBegin" and "tableEnd"
 *                           must be exactly the same to the table be properly
 *                           parsed.
 * 
 * The table content can be a cell or a header.
 * 
 *   -- | cellText |      -> Cell pattern.
 *   -- |: headerText |   -> Header pattern.
 *   
 * You can also fill the table content with extra characters to improve the
 * readability as the following example. We used "-" characters, but any
 * character not a cell delimitor ("|") can be used.
 *   
 * *Table Example:*
 * 
 * [-------------------------------------------------------------------]
 *   +======+========+===================+
 *   |:Name |:Gender |:Website           |
 *   -------------------------------------
 *   |John  |*Male*  |[[http://john.com]]|
 *   |Mary  |*Female*|[[http://mary.com]]|
 *   -------------------------------------
 *   |||Long cell (colspan)              |
 *   +======+========+===================+
 * [-------------------------------------------------------------------]
 * 
 * The above code will look like this:
 *  
 *   +======+========+===================+
 *   |:Name |:Gender |:Website           |
 *   -------------------------------------
 *   |John  |*Male*  |[[http://john.com]]|
 *   |Mary  |*Female*|[[http://mary.com]]|
 *   -------------------------------------
 *   |||Long cell (colspan)              |
 *   +======+========+===================+
 *   
 *   Note that you can use wiki syntax inside tables (as you can do with lists). 
 *   You can also create a span cell using empty cells before the target cell. 
 *   In practice, the number of |'s before the cell text indicates how big 
 *   the cell is. In the example, 3 |'s indicate that this cell has the size 
 *   of 3 cells.
 *   
 *   The extra spaces, break lines extra characters ("----" in this example) 
 *   are all optional, used to make the code more readable. You can safely 
 *   remove all those characters if you want. The only restriction is 
 *   that the table delimitors at begin and end must be identical. For example,
 *   the table above can be rewritten like the following:
 *   
 * *Compact Table Definition Example:*
 *   
 * [-------------------------------------------------------------------]
 *   ++++
 *   |:Name|:Gender |:Website|
 *   |John|*Male*|[[http://john.com]]|
 *   |Mary|*Female*|[[http://mary.com]]|
 *   |||Long cell (colspan)|
 *   ++++
 * [-------------------------------------------------------------------]
 *   
 * *Even More Compact Table Definition Example:*
 * 
 * [-------------------------------------------------------------------]
 *   ++++|:Name|:Gender |:Website||John|*Male*|[[http://john.com]]||Mary|
 *   *Female*|[[http://mary.com]]||||Long cell (colspan)|++++
 * [-------------------------------------------------------------------]
 * 
 *   Like was said, the table delimitors at begin and end must be identical.
 *   The following example ilustrates this case. This example won't generate
 *   a the desired table because the delimitor "+=+++" is different than 
 *   "++++".
 *  
 * *Compact Table Bad Syntax Example:*
 *   
 * [-------------------------------------------------------------------]
 *   +=+++
 *   |:Name|:Gender |:Website|
 *   |John|*Male*|[[http://john.com]]|
 *   |Mary|*Female*|[[http://mary.com]]|
 *   |||Long cell (colspan)|
 *   ++++
 * [-------------------------------------------------------------------]
 *   
 * @name customWiki
 * @namespace
 * @author Pedro Simonetti Garcia
 */
customWiki = function(){

  // Internal Templates
  var reTemplate = /\{(?!\!%)(\d+)(?:\|([^\}]*))?\}/g;
  var reTemplateScript = /\{\!(.*?)\!\}/g;
  var reTemplateOptions = /\{%(.*?)%\}/g;
  
  var tplReIgnored = /<%ignoredElement(\d+)%>/g;
  var tplReTableAttributes = /<%tableAttributes%>/g;

  // RegExp special chars to be escaped
  var reSpecialChars=/(\^|\$|\.|\*|\+|\?|\=|\!|\:|\||\\|\/|\(|\)|\[|\]|\{|\})/g;

  // Utility Expressions
  var reTrim = /^\s*|\s*$/g;
  var reDoubleSpace = /\s\s/g;
  
  // Internal Templated Regular Expressions
  var re = {};
  
  var cacheReTableRows = {};
  
  /**#@+
   * @memberOf customWiki
   */
  
  /**
   * Parse a single list.
   * 
   * @param {Object} s
   */
  var _parseList = function(s) {
    if (!s)
      return '';
      
    var list = {
        childs: [] 
      };
    var parents = [list], lastParent = list, lastItem, lastDepth = 1;
    
    s = s.replace(/^(\s?\n)+/, '');
    
    // Process each list element, generating the parsed "list" object
    s.replace(re.listItems, function(e){
      var ident = arguments[1];
      var type = arguments[2];
      var value = arguments[3].replace(reTrim, '');
      var target;
      var m = ident.replace(/\n/g, '').match(/\s{2}/g);
      var depth = m && m.length || 0;
      
      // If depth change, find the appropriate parent.
      if (depth != lastDepth) {
        if (depth > lastDepth) {
          parents.push(lastItem);
        } else {
          for (var d=0, l=lastDepth-depth; d<l; d++)
            parents.pop();
        }
        lastParent = parents[parents.length-1];
        lastDepth = depth;
      }
        
      // Find the appropriate target
      target = lastParent && lastParent.childs || target;
      if (!target)
        return '';
      
      // Adds the current item to its parent
      target.push({
          value: value,
          type: type,
          childs: []
        });
        
      // Track the last item, because it may be a parent
      lastItem = target[target.length-1];
    });

    // Generate the list output
    return _generateListOutput(list.childs);
  };
  
  /**
   * Generate the String output of a single list
   * @param {Object} list
   */
  var _generateListOutput = function(list) {
    if (list.length == 0)
      return '';
      
    // Check if it is a ordered or unordered list
    var tag=list[0].type == customWiki.options.$ol.replace(/\\/g,'')?'ol':'ul';

    var r = ['<'], rl =1;
    r[rl++] = tag
    r[rl++] = '>\n';
    
    // Process items (<li>)
    for (var i=0, item; item=list[i]; i++) {
      r[rl++] = '<li>';
      r[rl++] = item.value;
      r[rl++] = '</li>\n';
      
      // Process chids (nested <ol> or <ul>)
      if (item.childs.length > 0)
        r[rl++] = _generateListOutput(item.childs);
    }

    // Closes the list tag and return the final result
    r[rl++] = '</';
    r[rl++] = tag;
    r[rl++] = '>';
    return r.join('');
  };
  
  /**
   * Parse a single table.
   * 
   * @param {Object} s
   */
  var _parseTable = function(s) {
    var o = customWiki.options;
    
    // Create the table with custom attributes defined in 
    // customWiki.options.table.attributes
    var r = [o.tplTableBegin], rl = 1;
    
    // Count the number of columns 
    var cols = s.match(re.tableDef)[0].match(re.tableColDef).length-1
    
    // Generate the table row expression based on the number of columns,
    // and cache the regular expression to later use
    var reTableRows = cacheReTableRows[cols];
    if (!reTableRows)
      reTableRows = cacheReTableRows[cols] = 
        new RegExp(o.tplReTableRows.replace('{colCount}', cols), 'g');
    
    // Parse each row
    s.replace(reTableRows, function(row) {
      
      // Column span information
      var spanCount = 1;
      var span = '';

      r[rl++] = '<tr>\n';
      
      // Parse each cell of the row
      row.replace(re.tableCells, function(all, header, cell){

        if (cell) {
          // Trims the cell content
          cell = cell.replace(reTrim, '');
          
          // Check for spans
          if (spanCount > 1) {
            span = ' colspan="' + spanCount + '"';
            spanCount = 1;
          } else {
            span = '';
          }
        
          // Check if it is a header or a normal cell
          if (header) {
            r[rl++] = '<th';
            r[rl++] = span;
            r[rl++] = '>';
            r[rl++] = cell;
            r[rl++] = '</th>\n';
          } else {
            r[rl++] = '<td';
            r[rl++] = span;
            r[rl++] = '>';
            r[rl++] = cell;
            r[rl++] = '</td>\n';
          }
        } else {
          // An empty cell will generate column span
          spanCount++;          
        }
        
      });
      r[rl++] = '</tr>\n';
    });

    // Closes the tag and return the final result
    r[rl++] = '</tbody></table>';
    return r.join('');
  };
  /**#@-*/
 
  return  /** @lends customWiki */ {
    
    /**
     * Creates all expressions that are not defined.
     */
    _buildRules: function() {
      
      var options = this.options, m, reName;
      for (var o in options) {
        // Escape regular expression special char if is a symbol definition
        if (o.match(/^\$/)) 
          options[o] = options[o].replace(reSpecialChars, '\\$1');
      }
      
      for (var o in options) {
        // Fill the options with data, represented as {%data%}
        options[o] = options[o].replace(reTemplateOptions, function(a, e){
          return options[e];
        });
      }
      
      for (var o in options) {
        // Create templated regular expressions
        if (m = o.match(/^tplRe(?:(\w)(\w*))/)) {
          reName = m[1].toLowerCase() + m[2];
          re[reName] = new RegExp(options[o], 'g');
        }
      }

      // Sort rules so the entries that have ignoreInnerWiki option turned on 
      // will be located in the beginning of the list
      var first = [], last = [];
      while (r = this.rules.shift()) {
        if (r.ignoreInnerWiki) {
          first.push(r);
        } else {
          last.push(r);
        }
      }
      this.rules = first.concat(last);
      
      var rules = this.rules
      for (var i=0, r; r=rules[i]; i++) {

        if (r.templatedExp) {
          // If is a templated regular expression, get the proper value
          r.exp = re[r.templatedExp];
          
        } else if (!r.exp) {
          // If regular expression is not defined, creates one
        
          var begin = r.begin || r.around;
          var end = r.end || r.around;

          // Escape RegExp special chars if not in advanced mode
          if (!r.advancedMode) {
            begin = begin.replace(reSpecialChars, '\\$1');
            end   = end.replace(reSpecialChars, '\\$1');
          }
          
          // Check if multine option is enabled
          var middle = r.multiline ? '[\\s\\S]' : '[^\\n]';

          // Creates the expression
          var exp = [begin], el = 1;
          exp[el++] = '(';
          exp[el++] = middle;
          exp[el++] = '*?)';
          exp[el++] = end;
          r.exp = new RegExp(exp.join(''), 'g');
        }
        
        if (r.template) {
          // Fill the template with options data
          r.template = r.template.replace(reTemplateOptions, function(a,e){
            return options[e];
          });
        }
      }

    },
    
    /**
     * Parses a wiki text into HTML.
     * 
     * @param {Object} s
     */
    parse: function(s) {
      if (!s)
        return '';

      // Ignore templates being matched on text, but preservers the {@link}
      s = s.replace(/\{([^@].*?)\}/g, '&#123;$1&#125;');

      // List of ignored elements
      var ignoredElements = [], ignoredCount = 0;
      
      // Parse all rules
      for (var i=0, l=this.rules.length, r; r=this.rules[i]; i++) {
        
        // Check if is a ignored element
        var isIgnored = r.ignoreInnerWiki;
        
        // Replace each matched result with the current rule expression
        s = s.replace(r.exp, function(){
          
          // All information about the matched expression.
          var m = arguments;
          
          if (r.template) {
            // Fill the template with the macthed groups
            var result = r.template.replace(reTemplate, 
              function(a, i, alt) {
                var t = m[i] || // Uses the value found in the group
                  parseInt(alt) && m[parseInt(alt)] || // or an alternative group
                  alt || // or an alternative value
                  '';
                return (typeof t != 'undefined') && t;
              });
          }
          
          // Call the parser for this rule, if there's one
          if (r.parser) {
            var result = r.parser(m[0]);
          }
          
          // Process the template scripts
          result = result.replace(reTemplateScript, function(a,e) {
            return eval(e);
          });
      
          if (isIgnored) {
            // save element to prevent being parsed
            ignoredElements.push(result);
            return '<%ignoredElement'+ (ignoredCount++) +'%>';

          } else {
            // replace the matched rule with the result
            return result;
          }

        });

      }
      
      // Process the saved ignored elements
      while (tplReIgnored.test(s)) {
        s = s.replace(tplReIgnored, function(a,i){
          return ignoredElements[i];
        });
      }
      
      // The final formatted result
      return s;
    },

    /**
     * Customwiki options. 
     * 
     * All options can be referred inside a template by using the {%optionName%} 
     * syntax. There are 3 kinds of options: general options, symbol options, 
     * and regular expression templates.
     * 
     * 
     * ===General Options===
     * 
     * Here you find some basic options to customize the behaviour of the
     * library. 
     * 
     * Specially, you have an option called "codeBlockAttributes", which 
     * defines the syntax highlight pattern that will be used inside code 
     * blocks. The default option presumes you are using the 
     * "Syntax Highlighter", a very popular syntax highlight tool 
     * (http://code.google.com/p/syntaxhighlighter/).
     * 
     * The default "Syntax Highlighter" is configured to hide gutter and 
     * controls. The language used is configurable via code blocks syntax, 
     * but if no one is used, then "js" will be choosed, indicating a 
     * JavaScript code.
     * 
     * If you use another syntax highlight tool, change this options to the 
     * pattern used in this tool. 
     * 
     * ===Symbol Options===
     * The symbols options represents some special symbols that is used
     * in complext regular expression templates. The name of the symbol must
     * begin with "$", in order to be properly escaped. The name also is
     * normally very short to make the regular expression templates smaller.
     * 
     * ===Regular Expressions Templates===
     * All regular expression templates must begin with the prefix "tplRe".
     * When the library is loaded, all options prefixed with "tplRe" will 
     * result in a creation of a regular expression with that template in the 
     * private "re" object. 
     * 
     * For example, the "tplReList" option, will result in a regular expression
     * in "re.list". To use a templated regular expression in a rule you must
     * use the property "templatedExp" in a rule definition. For example, 
     * using:
     * [-------------------------------------------------------------------]
     *     templatedExp: 'list'
     * [-------------------------------------------------------------------]
     *     
     * will indicate that the "re.list" should be used to parse the rule.
     */
    options: {
      //----------------------------------------------------------------
      // General options
      //----------------------------------------------------------------

      // Table attributes
      tableAttributes: 'border="1" padding="0" cellspacing="0"',
      
      // Table template
      tplTableBegin: '<table {%tableAttributes%}><tbody>\n',

      // Code block attributes
      codeBlockAttributes: 'class="prettyprint lang-{1|js}"',

      //----------------------------------------------------------------
      // List and Table Symbols
      //----------------------------------------------------------------
      
      // List symbols options
      $ol: '#', // Ordered list symbol
      $ul: '-', // Unordered list symbol
      
      // Table symbols options
      $td: '+', // Table column definition symbol
      $tf: '=', // Table column fill symbol
      $ts: '|', // Table column cell separator symbol
      $th: ':', // Table header definition symbol
      
      //----------------------------------------------------------------
      // Lists/Tables regular expression templates (change with caution)
      //----------------------------------------------------------------

      // List regular expressions templates
      tplReList: '(\\s{2,}[{%$ol%}{%$ul%}][^\\n{%$ol%}{%$ul%}]([^\\n]|\\n[^\\S\\n]*([^\\s{%$ol%}{%$ul%}<]|<(a|b|i|span|code|img)))+)+',
      tplReListItems: '([^\\S\\n]{2,})([{%$ol%}{%$ul%}])((?:[^\\n]|\\n[^\\S\\n]*([^\\s{%$ol%}{%$ul%}<]|<(a|b|i|span|code|img)))+)',
      
      // Table regular expressions templates
      tplReTable: '({%$td%}[{%$td%}{%$tf%}]+)\\s*{%$ts%}[\\s\\S]+?(\\1)',
      tplReTableCells: '{%$ts%}({%$th%}?)([^{%$ts%}]*)',
      tplReTableRows: '({%$ts%}[^{%$ts%}]*){{colCount}}{%$ts%}',
      
      tplReTableDef: '[^{%$ts%}]+',
      tplReTableColDef: '{%$td%}'
    },
    
    /**
     * Custom wiki rules. This rules define all elements of the syntax, except
     * tables and lists elements (which are parsed with special functions).
     * The tables and lists options can be found at customWiki.options.
     * 
     * A rule describes the behaviour of a single element of the syntax. 
     * There's a rule for 'bold', other for 'italic', and so on.
     * 
     * Each rule can have several properties, which can be cathegorized as:
     * 
     *   -- Template   -> represents the HTML parsed result of the element.
     *   -- Expression -> one or more properties that describe the logical
     *                   expression that represents the element syntax.
     *   -- Parser     -> a parser function to process complex patterns.
     *   -- Options    -> extra options to add special treatment to the rule.
     * 
     * 
     * ==1. Rule Template==
     * 
     * The template is defined through the "template" property. The template
     * is generally a HTML string with some teplate elements (surrounded by {}).
     * 
     * There's 3 kinds of template elements: groups, options, and scripts.
     * 
     * 
     * ===1.1 Template Groups===
     * 
     * The template groups are represented as:
     * 
     * [-------------------------------------------------------------------]
     *   {number [ |altValue ]}
     * [-------------------------------------------------------------------]
     * 
     *   A template group represents a matched group in the regular expression
     *   of the template's rule. Normally you will use "{1}" which represents
     *   the first matched group. When you use simple expressions using
     *   "begin", "end", or "around" properties, the "{1}" will represent the
     *   inner content of the rule. You can also use "{0}" which represents all
     *   the matched string, including the special symbols.
     *   
     *   Optionally, you can use a alternative value using the {number|altValue}
     *   syntax, to indicate a value to be used if the group is empty. The 
     *   "altValue" can be a number, indicating another matched group, or 
     *   a string, representing the alternate text to be shown.
     * 
     * 
     * ===1.2. Template Options===
     * 
     * The template Options are represented as:
     * 
     * [-------------------------------------------------------------------]
     *   {%option%}
     * [-------------------------------------------------------------------]
     * 
     *   Refers an option at customWiki.options. For example, the 
     *   {%codeBlockAttributes%} in a template will be replaced with the
     *   text of the property customWiki.options.codeBlockAttributes.
     * 
     * 
     * ===1.3. Template Script===
     * 
     * The template groups are represented as:
     * 
     * [-------------------------------------------------------------------]
     *   {!script!}
     * [-------------------------------------------------------------------]
     * 
     *   Executes a script with template data. Inside the template script, the
     *   "m" variable represents the matched groups. So, m[1] will represent
     *   the first matched group, and m[0] will represetns the whole string,
     *   like the template groups syntax. For example, the {!m[1].length!} will
     *   be replace with the number of characters of the first matched group.
     * 
     * 
     * ==2. Rule Parser==
     * 
     * The "parser" property is a replacement of the "template" property,
     * to allow complex parsings. 
     * 
     * Sometimes, a single single regular expression combined with a single 
     * template can't handle the parsing of a specific element.In this case, 
     * you create a general expression that describes the whole element, and 
     * insted of declaring a "template" property, you specify a function in 
     * the "parser" property that will parse the element fragments, and 
     * return the formatted string.
     * 
     * 
     * ==3. Rule Expression==
     * 
     * There are five different ways of defining a rule expression. In order
     * of simplicity: 
     * 
     * ===3.1. "around" property===
     * 
     *   Will create a expression that matches all charcters surround by the
     *   specified symbol(s). Example:
     *   
     * [-------------------------------------------------------------------]
     *   around: "*"
     * [-------------------------------------------------------------------]
     * 
     *   Note: you don't have to escape the regular expression special chars.
     *   Use "*" insted of "\*" or "\\*".
     * 
     * ===3.2. "begin" and "end" properties===
     * 
     *   Similar to "around" property, will create a expression that matches 
     *   all charcters surround by the specified "begin" and "end" symbol(s).
     *   Example:
     *   
     * [-------------------------------------------------------------------]
     *   begin: '[[',
     *   end: ']]'
     * [-------------------------------------------------------------------]
     *     
     *   Note: you don't have to escape the regular expression special chars.
     *   Use "*" insted of "\*" or "\\*".
     * 
     * ===3.3. advanced patterns===
     * 
     *   You can use advanced "around", "begin" and "end" patterns by seting 
     *   the optional property "advancedMode" to "true". In advanced mode, the
     *   "around", "begin" and "end" properties will be treated as regular 
     *   expressions insted of text. Example:
     *   
     * [-------------------------------------------------------------------]
     *   advancedMode: true,
     *   begin: '\\[\\[',
     *   end '(?:\\|(.*?))?\\]\\]'
     * [-------------------------------------------------------------------]
     *   
     *   Note: When using advanced mode, you have to manually escape all
     *   regular expressions special chars using double backslashes "\\".
     * 
     * ===3.4. "exp" property===
     * 
     *   The most powerfull (but the least readable and least customizable)
     *   way of definning a expression is using the a regular expression
     *   through the "exp" property.
     * 
     * ===3.5. "templatedExp" property===
     * 
     *   Templated expressions combine the power of regular expressions with
     *   the flexibility of templates. All options in customWiki.options 
     *   that starts with "tplRe" will be considered a template for regular
     *   expressions. When the library is loaded, will be created a expression
     *   with that template in the "re" object. For example, the "tplReList"
     *   option, will result in a "re.list" expression.
     *   
     *   You can refer any expression inside the "re" object by using the
     *   "templatedExp" property. For example, using:
     *   
     * [-------------------------------------------------------------------]
     *   templatedExp: 'list'
     * [-------------------------------------------------------------------]
     *     
     *   will indicate that the "re.list" should be used to parse this rule.
     * 
     * 
     * ==4. Rule Options==
     * 
     *   The rules has 3 options properties: advancedMode, multiline, and
     *   ignoreInnerWiki.
     *   
     *   -- advancedMode    -> When set to "true", the "around", "begin" 
     *                         and "end" properties will be treated as regular 
     *                         expressions, insted of text.
     *   -- multiline       -> Allows the expression to have break lines. The
     *                         default is "false".
     *   -- ignoreInnerWiki -> Indicates that the wiki syntax should be ignored 
     *                         inside the matched content of the rule. The 
     *                         default is "false".
     *   
     *   
     * ==5. Rule Examples==
     *   Some examples:
     *   
     * This rule will make the wiki syntax to be ignored inside all tables.
     * [-------------------------------------------------------------------]
     *   {
     *     // Ignore wiki syntax inside tables
     *     ignoreInnerWiki: true,
     *     multiline: true,
     *     begin: '<table',
     *     end: '</table>',
     *     template: '{0}'
     *   }
     * [-------------------------------------------------------------------]
     *   
     * This rule will add an extra syntax element to create custom HTML 
     * elements.
     * [-------------------------------------------------------------------]
     *   {
     *   // Create a custom HTML Element
     *   advancedMode: true,
     *   multiline: true,
     *   begin: '%%(\\w+)[\\s\\n]?',
     *   end: '%%',
     *   template: '<{1}>{2}</{1}>'
     *   }
     * [-------------------------------------------------------------------]
     *   
     *   Examples of this rule use:
     * [-------------------------------------------------------------------]
     *   %%hr%% // will generate "<hr></hr>"
     *   %%span text%% // will generate "<span>text</span>"
     * [-------------------------------------------------------------------]
     *   
     *   And since the "multiline" option is "true" you can use break lines:
     * [-------------------------------------------------------------------]
     *   %%div
     *   This is the
     *   div content
     *   %%
     * [-------------------------------------------------------------------]
     *   
     *   
     */
    rules: [
    
      // -----------------------------------------------------------------------
      // Custom rules used to document customWiki itself ----------------------
/*
      {
        // Ignore wiki syntax in quoted text
        ignoreInnerWiki: true,
        exp: /(["'])[^\n\1]+?\1/g,
        template: '<code>{!m[0].replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\')!}</code>'
      },{
        ignoreInnerWiki: true,
        multiline: true,
        advancedMode: true,
        begin: '(\\[-+\\])',
        end: '\\1',
        template: '<pre class="example">{!m[2].replace(/<(\\/?\\w+)>/g, \'&lt;$1&gt;\')!}</pre>'
      },{
        // Syntax items
        ignoreInnerWiki: true,
        exp: /\s{2,}--(.*?)->((?:[^\n]|\n[^\S\n]*[\w"'])+)?/g,
        template: '<div><code style="display:block; float:left; position: absolute; padding-right:10px; text-align:right; width:170px;font-weight:bold;">{1}</code> <div style="position:relative; width:350px; left:190px;">{2}</div></div>'
      },
*/
      // Custom rules used to document customWiki itself ----------------------
      // -----------------------------------------------------------------------

      {
        begin: '"',
        end: '"',
        template: '~{@link {1}}~'
      },{
        // lists
        ignoreInnerWiki: true,
        templatedExp: 'list',
        parser: _parseList
      },{
        // tables
        templatedExp: 'table',
        parser: _parseTable
      },{
        // code block
        ignoreInnerWiki: true,
        exp: /~~(?:(?::([^\s]+)\s?)?([^~]+))~~/g, 
        template:'<pre {%codeBlockAttributes%}>{2}</pre>'
      },{
        // inline code
        around: '~',
        template: '<code>{1}</code>'
      },{
        // Links
        advancedMode: true,
        begin: '\\[\\[',
        end: '(?:\\|(.*?))?\\]\\]',
        template: '<a href="{1}">{2|1}</a>'
      },{ 
        // bold
        around: '*',
        template: '<b>{1}</b>'
      },{
        // italic
        around: '__',
        template: '<i>{1}</i>'
      },{ 
        // superscript
        around: '^',
        template: '<sup>{1}</sup>'
      },{ 
        // subscript
        around: '`',
        template: '<sub>{1}</sub>'
      },{
        // headers
        advancedMode: true,
        begin: '(={2,})',
        end: '\\1',
        template: '<h{!m[1].length!}>{2}</h{!m[1].length!}>'
      },{
        // paragraphs 
        exp: /([^\s<]+|<\/\w+>)(\s?\n\s*){2,}(?=[^\n])/g,
        template: '{!m[1]?(m[1]+"\\n"):""!}<p>\n'
      },{
        // paragraphs 
        exp: /^(\s*\S)/g,
        template: '<p>\n{1}'
      }
    ]
  }
}();

customWiki._buildRules();

})();