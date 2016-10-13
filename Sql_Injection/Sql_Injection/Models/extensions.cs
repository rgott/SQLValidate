using System.Collections.Generic;

namespace Sql_Injection.Models
{
    public static class extensions
    {
        public static List<string> MultiSplit(this string value, params string[] findIndexes)
        {
            List<string> list = new List<string>();
            int min = value.Length;
            string minValue = "";
            int index;
            for (int i = 0; i < findIndexes.Length; i++)
            {
                index = value.IndexOf(findIndexes[i]);
                if (index != -1 && index < min)
                {
                    minValue = findIndexes[i];
                    min = index;
                }
            }
            if (min == value.Length)
            {
                // no change get right
                list.Add(value.Trim());
                return list;
            }
            string retVal = value.Substring(0, min);
            list.Add(retVal.Trim());
            int minV = min + minValue.Length;
            value = value.Substring(minV, value.Length - minV);
            list.AddRange(MultiSplit(value, findIndexes));
            return list;
        }
    }
}