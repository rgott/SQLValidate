var messageOutToUser = "";

//TODO:next version show where the first error is in the text
var errorPartitionText = "";

//#region testing section
var FAILED = 0;
var PASSED = 0;

//tester();

function testValidate(value,expectedValue)
{
    if(value == expectedValue)
        PASSED++;
    else
        console.log("TEST "+ (FAILED++ + PASSED) + " FAILED: need " + expectedValue);    
}
function tester()
{
    var inputString;

    testValidate(IsValidExpression("select * from table where 1 = 5"),false);

    testValidate(IsValidExpression("select * from table where 1 = "),true);

    testValidate(IsValidExpression("select * from table where 1"),true);

    testValidate(IsValidExpression("select * from table where "),true);

    testValidate(IsValidExpression("select * from table where blah = blah"),false);
    
    testValidate(IsValidExpression("select * from table where blah = 1 or 1 = 1"),false);

    testValidate(IsValidExpression("select * from table where '1' = '1'"),false);

    testValidate(IsValidExpression("select * from table where A(3 - (6 * 9)) * toInt('6') = 6"),false);

    testValidate(IsValidExpression("select * from table where A(B(C(D(6 * 6))* 4)) = 42"),false);

    testValidate(IsValidExpression("select * from table where A(B(C(D(6 * 6))* column))"),true);

    testValidate(IsValidExpression("select * from table where A(3 - (6 * 9)) * toInt(column)"),true);

    testValidate(IsValidExpression("select * from table where 1 * 1 = 1"),false);

    testValidate(IsValidExpression("select * from table where 1 * Func(1) = 23"),false);

    testValidate(IsValidExpression("select * from table where 1 * --Func(1) = 23"),false);
    
    testValidate(IsValidExpression("select * from table where 1 * 1 - 1 + 1 / 1 = 1"),false);

    testValidate(IsValidExpression("select * from table where t = 6 or two = 2"),true);

    console.log("Testing Complete\nPASSED: " + PASSED + "\nFAILED: " + FAILED);
}
//#endregion testing section


/*
 will be used by the .html page to grab information
 from the document and then return results to the page
 */
function inputChange()
{
    var inputString = document.getElementById("fname").value;
	// var inputString = "select * from table where 1 = 1";
    if(IsValidExpression(inputString))
    {

        $('#card').addClass('green').removeClass('red').removeClass('blue');
        document.getElementById("messageOutToUser").innerHTML = "Success!";
    }  
    else
    {
        $('#card').addClass('red').removeClass('green').removeClass('blue');
        document.getElementById("messageOutToUser").innerHTML = "Failure: " + messageOutToUser + "!";
    }
}
function IsValidExpression(sqlQuery)
{
    var readyParse = readyWhereForParse(sqlQuery);

    if(!readyParse)
        return true;// no string to parse
    
    if(!passedPreTestConditions(sqlQuery))
        return false; // messageOutToUser is set in passedPreTestConditions

    var expressionList = MultiSplit(readyParse, ["and","or"]);

    for(k = 0; k < expressionList.length; k++)
    {
        var stdOperaterToken = [ "=", "like", "not like", "<>", "!=", ">", "<", ">=", "<=" ];
        var tmpForVar = MultiSplit(expressionList[k],stdOperaterToken);

        if(tmpForVar.length % 2 == 1)
            tmpForVar.pop();
        if(tmpForVar.length == 0)
            return true; // no list left to parse

        // is always even
        for(j = 0; j < tmpForVar.length; j += 2)
        {
            if(tmpForVar[j] === tmpForVar[j + 1])
            {
                messageOutToUser = "variables or constants cannot match on both sides of equation";
                return false; // if equal to eachother then always false
            }

            if(HasSqlConstants(tmpForVar[j]) && HasSqlConstants(tmpForVar[j + 1]))
            {
                messageOutToUser = tmpForVar[j] + " and " + tmpForVar[j + 1] + " are both constants. Can't have contants on both sides of the equation";
                return false;
            }
        }
    }
    return true;
}

/*
 if sql constant then return true
 constants are strings or integers or functions
*/
function HasSqlConstants(value)
{
    var stoValue = value;
    var quoteMark = "'";

    // remove functions constants to try to find any non-constants
    if(value.includes("("))
    {
        // functions are treated as constants and are removed
        value = value
                    .replace(/[a-z1-9]+[(]/g,"")
                    .replace(/[(]/g,"")
                    .replace(/[)]/g,"");
    }
    
    var operand = MultiSplit(value,["*","/","-","+"]);

    for(i = 0; i < operand.length; i++)
    {
        if(!operand[i].includes(quoteMark) && isNaN(operand[i]))
        { // does not include quote mark is not a number then not a constant
            return false;
        }
    }
    messageOutToUser = stoValue + " contains all constants"
    return true;
}


// tests performed after query is ready to be 
// parsed to determine if it can quickly fail
function passedPreTestConditions(sqlQuery)
{
    // continue with pre condition tests
    // query is garanteed lower case

    if(sqlQuery.includes("--") 
    || sqlQuery.includes("/*"))
    {
        messageOutToUser = "Query contained a comment"
        return false;
    }
    
    //TODO: more pre-conditions

    return true;
}

/*
Given a string @value : string, @findIndexes : string[] 
will find all values on either side
and return the operands as an array 

NOTE: consumes findIndexes
*/
function MultiSplit(value,findIndexes)
{
    var list = [];
    while(value.length !== 0)
    {
        var min = value.length;
        var minValue = "";
        
        // finds minimum index in the findIndexes array
        for(i = 0; i < findIndexes.length; i++)
        {// find minimum
            var index = value.indexOf(findIndexes[i]);
            if(index == -1)
            {
               findIndexes.splice(i, 1); // remove element
               i--; // reset to previous
               continue;
            }
            else if(index < min)
            {
                minValue = findIndexes[i];
                min = index;
            }
        }
        if(findIndexes.length === 0)
            break;
        
        var retVal = value.substring(0,min).trim(); // get left side
        if(retVal !== "")
        {
            list.push(retVal);
        }

        var minV = min + minValue.length;
        value = value.substring(minV,value.length);
    }
    if(value.trim() !== "") 
    {
        list.push(value.trim());
    }

    return list;
}

function readyWhereForParse(sqlQuery)
{
    // equalize string for parser
    sqlQuery = sqlQuery.toLowerCase();

    var indexOfWhereClause = sqlQuery.indexOf("where");
    if(indexOfWhereClause == -1) // if were not found then return nothing
        return "";
    
    // get everything after "where" clause
    indexOfWhereClause += "where".length; // remove the actual where word
    sqlQuery = sqlQuery.substring(indexOfWhereClause,sqlQuery.length);

    // remove ; and replace " with '
    sqlQuery = sqlQuery
                .replace(";","")
                .replace(/['"]+/g,"'")
                .trim();
    return sqlQuery;
}
