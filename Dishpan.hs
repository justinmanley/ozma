{-# LANGUAGE OverloadedStrings, DeriveGeneric  #-}
module Dumpfile (parseDumpfile) where

import Text.ParserCombinators.ReadP
import Data.Char
import System.IO (readFile)
import Data.Aeson ((.:), (.:?), decode, FromJSON(..), Value(..), fromJSON)
import Control.Applicative ((<$>), (<*>))
import qualified Data.ByteString.Lazy.Char8 as C
import GHC.Generics
import Data.Aeson.Parser (json)

data Dumpfile = Dumpfile {
	unpack :: [[String]]
}

data SurveyResponse = SurveyResponse Int String Timestamp
	deriving Show

data PathData = PathData {
	path :: [String],
	timestamps :: [String]
} deriving (Show, Generic)

data LatLng = LatLng { lat, lng :: String } deriving (Show, Generic)

data Timestamp = Timestamp {
	year :: Int,
	month :: Int,
	day :: Int,
	hour :: Int,
	minute :: Int,
	second :: Int
} deriving Show

instance FromJSON PathData
instance FromJSON LatLng

parse :: ReadP a -> String -> a
parse p s = case [a | (a,"") <- readP_to_S p s] of
	[x] -> x
	[] -> error "No parse."
	_ -> error "Ambiguous parse."

parseDumpfile = parse dumpfile_parse where
	dumpfile_parse = record `endBy` newline
	record = do
		id <- munch isNumber
		tab
		field -- unique identifier for user
		tab
		field --kmlstring
		tab
		jsonString <- jsonParse
		tab
		time <- timestamp
		return $ SurveyResponse (read id) jsonString time
	tab = char '\t'
	field = munch (`notElem` "\t\n\r")
	newline = string "\n" <++ string "\r\n" <++ string "\r"

jsonParse = do
	char '{'
	str <- munch isAlpha
	char '}'
	return str

timestamp = do
	year <- munch isNumber
	char '-'
	month <- munch isNumber
	char '-'
	day <- munch isNumber
	char ' '
	hour <- munch isNumber
	char ':'
	minute <- munch isNumber
	char ':' 
	second <- munch isNumber
	return $ Timestamp (read year) (read month) (read day) (read hour) (read minute) (read second)

parsePathData :: String -> Maybe PathData
parsePathData = (decode . C.pack)