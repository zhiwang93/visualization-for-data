#Download all the on-time performance data from 2003.6 to 2017.8
#Modify path first!

import urllib.request
import os
import time

def percentage(a, b, c):
	per = 100.0 * a * b / c
	if per > 100:
		per = 100
	print('%.2f%%' % per)


prefix = "https://transtats.bts.gov/PREZIP/On_Time_On_Time_Performance_"
prefix2 = "On_Time_On_Time_Performance_"
postfix = ".zip"

for year in range(2003, 2018):
    for month in range(1, 13):
        if year == 2003 and month < 6:
            continue;
        if year == 2017 and month > 8:
            continue;
        url = prefix + str(year) + "_" + str(month) + postfix
        filename = prefix2 + str(year) + "_" + str(month) + postfix
        path = os.path.join("/home/u1143816/Downloads/data_delay", filename)
        print(url)
        urllib.request.urlretrieve(url, path, percentage)
        time.sleep(60)