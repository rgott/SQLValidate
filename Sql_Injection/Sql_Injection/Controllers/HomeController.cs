using Sql_Injection.Models;
using System.Collections.Generic;
using System.Web.Mvc;

namespace Sql_Injection.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// Function gets id to check with database
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View(new SqlViewModel());
        }

        [HttpPost]
        public ActionResult Index(SqlViewModel model)
        {
            if (model?.sqlQuery != null)
            {
                // TODO: change method naming convention
                model.isValidQuery = validateSqlQuery(model.sqlQuery);
            }
            return View(model);
        }

        private bool? validateSqlQuery(string sqlQuery)
        {
            // equalize string for parsing
            sqlQuery = sqlQuery.ToLower();

            int indexOfWhereClause = sqlQuery.IndexOf("where"); // reduce the amount tested
            if (indexOfWhereClause == -1) // if no where clause the query must be logically secure
                return true;
            else
                indexOfWhereClause += "where".Length;

            // get everything after "where" clause
            sqlQuery = sqlQuery.Substring(indexOfWhereClause, sqlQuery.Length - indexOfWhereClause);

            // resolve issues that may occur between the parser and the query
            sqlQuery = sqlQuery
                .Replace(";", "")
                .Replace("\"", "'");
            return isValidExpression(getExpressionListFromQuery(sqlQuery));
            //return validateSqlQueryFull(sqlQuery);
        }

        private List<string> getExpressionListFromQuery(string sqlQuery)
        {
            //TODO: remove once tested multiSplit
            
            //SortedSet<string> list = new SortedSet<string>();
            // get all possible security flaws
            // find or statements
            // find operators between statements
            // "operator and operator or operator"

            //int prevIndex = 0;
            //int index;


            //while ((index = sqlQuery.IndexOf("or", prevIndex + 1)) != -1)
            //{
            //    // get left side
            //    int tempV = prevIndex + "or".Length;
            //    string left = sqlQuery.Substring(tempV, index - tempV);
            //    int indexAND = left.LastIndexOf("and");
            //    if (indexAND != -1)
            //    {
            //        int tmpLen = indexAND + "and".Length;
            //        left = left.Substring(tmpLen, left.Length - tmpLen);
            //    }

            //    // get right side
            //    int tmpV = index + "or ".Length;
            //    string nextToken = sqlQuery.Substring(tmpV, sqlQuery.Length - tmpV);
            //    string right = nextToken;
            //    int RndexAND = right.IndexOf("and");
            //    int RndexOR = right.IndexOf("or", 1);

            //    RndexAND = (RndexAND == -1) ? 0 : RndexAND;
            //    RndexOR = (RndexOR == -1) ? 0 : RndexOR;
            //    int cndex = (RndexAND < RndexOR) ? RndexAND : RndexOR;
            //    cndex = (cndex == 0) ? right.Length :cndex;
            //    right = right.Substring(0, cndex);

            //    list.Add(left.Trim());
            //    list.Add(right.Trim());
            //    prevIndex = index;
            //}
            List<string> list = sqlQuery.MultiSplit(new string[] { "and", "or" });
            return list;
        }
        
        private bool? isValidExpression(List<string> expressionList)
        {
            foreach (var item in expressionList)
            {
                
            }
            string[] stdOperaterToken = { "=", "like","not like", "<>", "!=", ">", "<", ">=", "<=" };
            foreach (var item in expressionList)
            {
                foreach (var operand in item.MultiSplit(stdOperaterToken))
                {
                    //
                    if(!isValidSqlExpression(operand))
                    {
                        return false;
                    }
                }
            }
            // obsolete
            //foreach (var item in expressionList)
            //{
            //    string stdOperator = stdOperaterToken.Find(m => item.Contains(m));
            //    int index = item.IndexOf(stdOperator);
            //    //get left of index
            //    string left = item.Substring(0, index);

            //    // get right of index without operator
            //    int val = index + stdOperator.Length;
            //    string right = item.Substring(val, item.Length - val);

            //    if(isValidSqlExpression(left) && isValidSqlExpression(right))
            //        return false;
            //}
            return true;
        }

        private bool isValidSqlExpression(string value)
        {
            const string quoteMark = "'";

            /*
             * if both have quote marks then they are strings
             * if no quote marks they must be integers
             * if function then will have () function(3 * function(3)) must be either function or constant to fail
             */

            // TODO: add arithmetic operations (e.g. 3 * 3) Hint: recursion may be required
            if (value.Contains("(")) //function fragment 
            {
                // TODO: add functions (e.g. fun(value * fun(3))) Hint: recursion may be needed
                    // function seen as constant
            }
            else if (value.Contains(quoteMark))
            { // then is string => constant
                return true;
            }
            else
            {
                double placeHold; // only used to satisfy function parameter
                if (double.TryParse(value, out placeHold))
                    return true; // if integer => constant
            }
            return false;
        }
        private bool isValidRange(string[] array, int minTest, int maxText)
        {
            return minTest >= 0 && maxText < array.Length;
        }
    }
}