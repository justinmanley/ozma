module Dumpfile (parseDumpfile) where

import Text.ParserCombinators.ReadP
import Data.Char

data Dumpfile = Dumpfile {
	unpack :: [[String]]
}

newline :: ReadP String
newline = string "\n" <++ string "\r\n" <++ string "\r"

tab :: ReadP String
tab = string "\t"

unique_id :: ReadP String
unique_id = munch isDigit

isNotTab = (/= "\t")

field = 	munch (\_ -> True)

instance Read Dumpfile where
	readsPrec _ = readP_to_S $ fmap Dumpfile $ dumpfile_parse where
		record = field `sepBy` tab
		dumpfile_parse = record `endBy` newline

parseDumpfile = unpack . read