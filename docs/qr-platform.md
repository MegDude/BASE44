# QR Platform

## Required QR Types

- property entry
- building lobby
- partner offer
- perk redemption
- event check-in
- campaign passport
- survey
- resident card
- report link

## Existing Support

Operations has `PartnerQrExperience` records and seeded QR relationships. Product routes include QR-related resident card and perk workflows.

## Missing API Contract

- `POST /api/qr/scan`
- `GET /api/qr/:id`

## Required Scan Flow

scan -> resolve QR -> identify linked entity -> validate status -> write scan -> attribute session/user -> trigger next action -> analytics -> audit -> return destination.
