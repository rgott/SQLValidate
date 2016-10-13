namespace Sql_Injection.Models
{
    public class SqlViewModel
    {
        public string sqlQuery { get; set; }
        public bool? isValidQuery { get; set; }
        public string isValidQueryColor
        {
            get
            {
                if (isValidQuery != null)
                {
                    if ((bool)isValidQuery)
                        return "green";
                    else
                        return "red";
                }
                else
                {
                    return "blue-grey";
                }
            }
        }
        public string isValidQueryString
        {
            get
            {
                if(isValidQuery != null)
                {
                    if((bool)isValidQuery)
                        return "No security threat";
                    else
                        return "Security threat detected";
                }
                else
                {
                    return "A threat cannot be deturmined at this time";
                }
            }
        }
        public string ID { get; set; }
    }
}