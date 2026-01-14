package common

const AccountIdOffset = 200000

func MaskID(realID, offSet int) int {
	return realID + offSet
}

func UnmaskID(publicID, offSet int) int {
	if publicID < AccountIdOffset {
		return 0
	}
	return publicID - offSet
}
