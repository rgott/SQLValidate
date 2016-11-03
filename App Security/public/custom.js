//tester();
var messageOutToUser = "";
function testValidate(str,value,expectedValue)
{
    var tmp;
    if(value == expectedValue)
    {
        tmp = " PASSED";
    }
    else
    {
        tmp = " FAILED: need " + expectedValue;
    }
    console.log(str + tmp);
}
function tester()
{
    var inputString;
    testValidate("TEST 1",IsValidExpression("select * from table where 1 = 5"),false);

    testValidate("TEST 2",IsValidExpression("select * from table where 1 = "),true);

    testValidate("TEST 3",IsValidExpression("select * from table where 1"),true);

    testValidate("TEST 4",IsValidExpression("select * from table where "),true);

    testValidate("TEST 5",IsValidExpression("select * from table where blah = blah"),false);
    
    testValidate("TEST 6",IsValidExpression("select * from table where blah = 1 or 1 = 1"),false);

    testValidate("TEST 7",IsValidExpression("select * from table where '1' = '1'"),false);

    testValidate("TEST 8",IsValidExpression("select * from table where A(3 - (6 * 9)) * toInt('6') = 6"),false);

    testValidate("TEST 9",IsValidExpression("select * from table where A(B(C(D(6 * 6))* 4)) = 42"),false);

    testValidate("TEST 10",IsValidExpression("select * from table where A(B(C(D(6 * 6))* column))"),true);

    testValidate("TEST 11",IsValidExpression("select * from table where A(3 - (6 * 9)) * toInt(column)"),true);

    testValidate("TEST 12",IsValidExpression("select * from table where 1 * 1 = 1"),false);

}
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
    var readyParse = readyForParse(sqlQuery);

    if(!readyParse)
        return true;// no string to parse
    
    if(!passedPreTestConditions(sqlQuery))
        return false; // messageOutToUser is set in passedPreTestConditions


    var expressionList = MultiSplit(readyParse, ["and","or"]);


    for(i = 0; i < expressionList.length; i++)
    {
        var stdOperaterToken = [ "=", "like", "not like", "<>", "!=", ">", "<", ">=", "<=" ];
        var tmpForVar = MultiSplit(expressionList[i],stdOperaterToken);

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

// if sql constant then return true
function HasSqlConstants(value)
{
    var stoValue = value;
    var quoteMark = "'";

    // tests function case remove functions
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
        {
            return false;
        }
        //will never enter function test again just contant part
        // if(!HasSqlConstants(operand[i].trim()))
        // {
        //     // if non constant then is valid;
        //     return false;
        // }
    }
    messageOutToUser = stoValue + " contains all constants"
    return true;
}

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
    
    // more pre-conditions

    return true;
}

function MultiSplit(value,findIndexes)
{
    var list = [];
    while(value.length !== 0)
    {
        var min = value.length;
        var minValue = "";
        
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

function readyForParse(sqlQuery)
{
    // equalize string for parser
    sqlQuery = sqlQuery.toLowerCase();

    var indexOfWhereClause = sqlQuery.indexOf("where");
    if(indexOfWhereClause == -1)
        return "";
    
    // get everything after "where" clause
    indexOfWhereClause += "where".length;

    sqlQuery = sqlQuery.substring(indexOfWhereClause,sqlQuery.length);

    sqlQuery = sqlQuery
                .replace(";","")
                .replace(/['"]+/g,"'")
                .trim();
    return sqlQuery;
}
