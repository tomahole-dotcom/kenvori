# Kenvori POD Factory

Gate 2 implementation.

## V1 flow
artwork URL -> Printify upload -> product creation -> optional publish to connected sales channel.

Publishing defaults to SAFE MODE. No live publish happens unless explicitly enabled.

## Environment
PRINTIFY_API_TOKEN=
PRINTIFY_SHOP_ID=
POD_LIVE_PUBLISH=false

## Next gate
1. Connect Printify merchant token/shop.
2. Run catalog discovery to select blueprint/provider/variants.
3. Create one controlled test product.
4. Add Etsy Seller App OAuth and draft-listing verification.
