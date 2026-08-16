-- Feed entries recorded before 0007 introduced notifications.href have an
-- empty click target, so "open" led back to the notifications page itself.
-- Point them at their module pages (the exact entity id is unknowable in
-- hindsight — new entries deep-link precisely).
update public.notifications
set href = case
  when event = 'review_new' then '/admin/reviews'
  when event = 'post_published' then '/admin/posts'
  else '/admin/leads'
end
where href = '';
